const { ipcRenderer } = require('electron');

// --- Window Controls ---
document.getElementById('close-btn').addEventListener('click', () => {
    ipcRenderer.send('app-control', 'close');
});

document.getElementById('minimize-btn').addEventListener('click', () => {
    ipcRenderer.send('app-control', 'minimize');
});

document.getElementById('maximize-btn').addEventListener('click', () => {
    ipcRenderer.send('app-control', 'maximize');
});

function startAll() {
    ipcRenderer.send('start-all');
}

function openWebsite() {
    ipcRenderer.send('app-control', 'open-website');
}


// --- Tab Switching ---
const navItems = document.querySelectorAll('.nav-item');
const views = {
    'SERVICES': document.querySelector('.services-grid'),
    'MANAGEMENT': document.getElementById('management-view'),
    'ANALYTICS': document.getElementById('analytics-view'),
    'SECURITY': document.getElementById('security-view')
};

function switchTab(targetView) {
    const loginOverlay = document.getElementById('login-overlay');
    const token = window.localStorage.getItem('adminToken');

    // If trying to access secure area without token, show login
    if (targetView !== 'SERVICES' && !token) {
        loginOverlay.style.display = 'flex';
        return;
    }

    // Update active class on sidebar
    navItems.forEach(item => {
        if (item.innerText.trim() === targetView) item.classList.add('active');
        else item.classList.remove('active');
    });

    // Hide overlay if it was shown
    loginOverlay.style.display = 'none';

    // Switch view
    Object.keys(views).forEach(key => {
        if (views[key]) {
            views[key].style.display = (key === targetView) ? 'grid' : 'none';
            if (key === targetView && key !== 'SERVICES' && key !== 'MANAGEMENT') {
                views[key].style.display = 'flex';
            }
            if (key === 'MANAGEMENT' && targetView === 'MANAGEMENT') {
                views[key].style.display = 'flex';
                fetchStocks();
                fetchUsers();
            }
        }
    });
}

navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.innerText.trim()));
});


// --- Service Handlers ---
const serviceStates = {
    redis: false,
    python: false,
    node: false,
    react: false
};

function toggleService(service) {
    if (serviceStates[service]) {
        ipcRenderer.send('stop-service', service);
    } else {
        ipcRenderer.send('start-service', service);
        appendLog(service, `Initializing ${service}...`, 'system');
    }
}

ipcRenderer.on('service-status', (event, { service, status }) => {
    const isRunning = status === 'running';
    serviceStates[service] = isRunning;

    const card = document.getElementById(`card-${service}`);
    const badge = document.getElementById(`badge-${service}`);
    const btn = document.getElementById(`btn-${service}`);

    if (isRunning) {
        card.classList.add('running');
        badge.innerText = 'RUNNING';
        btn.innerText = 'STOP SERVICE';
        appendLog(service, `Status: ONLINE`, 'system');
    } else {
        card.classList.remove('running');
        badge.innerText = 'STOPPED';
        btn.innerText = 'START SERVICE';
        appendLog(service, `Status: OFFLINE`, 'system');
    }
});

// --- Log Monitor ---
const logOutput = document.getElementById('log-output');

function appendLog(service, data, type = 'info') {
    const p = document.createElement('p');
    const timestamp = new Date().toLocaleTimeString();

    if (type === 'system') {
        p.className = 'system-msg';
        p.innerHTML = `<span class="log-label">[${timestamp}]</span> ${data}`;
    } else if (type === 'error') {
        p.className = 'error-msg';
        p.innerHTML = `<span class="log-label">[${timestamp}] [${service}]</span> ERROR: ${data}`;
    } else {
        p.innerHTML = `<span class="log-label">[${timestamp}] [${service}]</span> ${data}`;
    }

    logOutput.appendChild(p);
    logOutput.scrollTop = logOutput.scrollHeight;

    // Limit log lines for performance
    if (logOutput.childNodes.length > 200) {
        logOutput.removeChild(logOutput.firstChild);
    }
}

ipcRenderer.on('service-log', (event, { service, data, type }) => {
    appendLog(service, data.trim(), type);
});

function clearLogs() {
    logOutput.innerHTML = '<p class="system-msg">[SYSTEM] Log monitor reset.</p>';
}

// --- Management API Logic ---
const API_BASE = 'http://localhost:5000/api';

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value.trim();
    const errorDiv = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    btn.innerText = 'AUTHENTICATING...';
    errorDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            window.localStorage.setItem('adminToken', data.token);
            window.localStorage.setItem('adminEmail', data.email);

            // Show main app
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';

            appendLog('system', `Admin Authenticated as ${data.email}`, 'system');
            fetchStocks();
            fetchPlatformStats();
        } else {
            errorDiv.innerText = data.message || 'Login Failed';
            errorDiv.style.display = 'block';
            btn.innerText = 'AUTHENTICATE';
        }
    } catch (e) {
        errorDiv.innerText = 'Connection Error: Is Backend Running?';
        errorDiv.style.display = 'block';
        btn.innerText = 'AUTHENTICATE';
    }
}

async function toggleUserStatus(userId, currentStatus) {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'Ban' : 'Unban'} this user?`)) return;
    try {
        await fetch(`${API_BASE}/admin/users/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.localStorage.getItem('adminToken')}` },
            body: JSON.stringify({ userId, status: !currentStatus })
        });
        fetchUsers();
    } catch (e) { }
}


async function fetchStocks() {
    try {
        const res = await fetch(`${API_BASE}/stocks`);
        const stocks = await res.json();

        const list = document.getElementById('stocks-list');
        const select = document.getElementById('manip-symbol');

        list.innerHTML = '';
        select.innerHTML = '<option>Select Stock...</option>';

        stocks.forEach(s => {
            // Update List
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `
                <span>${s.symbol}</span>
                <span style="opacity:0.5; font-size:10px">${s.name}</span>
                <span style="flex:1; text-align:right">$${parseFloat(s.price).toFixed(2)}</span>
                <button onclick="deleteStock('${s.id}')" class="row-delete-btn">×</button>
            `;
            list.appendChild(row);

            // Update Manipulation Select
            const opt = document.createElement('option');
            opt.value = s.symbol;
            opt.innerText = `${s.symbol} (${s.name})`;
            select.appendChild(opt);
        });
    } catch (e) {
        appendLog('system', `Failed to fetch stocks: ${e.message}`, 'error');
    }
}

async function fetchUsers() {
    try {
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${window.localStorage.getItem('adminToken')}` }
        });
        const users = await res.json();
        const list = document.getElementById('users-list');
        list.innerHTML = '';

        users.forEach(u => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `
                <span>${u.email.split('@')[0]}</span>
                <span class="${u.is_active ? 'text-success' : 'text-error'}" style="flex:1; text-align:center">${u.is_active ? 'ACTIVE' : 'BANNED'}</span>
                <button onclick="toggleUserStatus('${u.id}', ${u.is_active})" class="btn-secondary" style="padding: 2px 8px; font-size: 10px">${u.is_active ? 'BAN' : 'UNBAN'}</button>
            `;
            list.appendChild(row);
        });
    } catch (e) {
        // Fallback or error
    }
}

async function deleteStock(id) {
    if (!confirm("Are you sure you want to delete this stock?")) return;
    try {
        await fetch(`${API_BASE}/admin/stock/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.localStorage.getItem('adminToken')}` },
            body: JSON.stringify({ id })
        });
        fetchStocks();
        appendLog('system', `Stock ID ${id} deleted`, 'system');
    } catch (e) { }
}

async function applyManipulation() {
    const symbol = document.getElementById('manip-symbol').value;
    const direction = document.getElementById('manip-direction').value;
    const minutes = document.getElementById('manip-time').value;

    if (!symbol || !minutes) {
        alert("Please select stock and enter time!");
        return;
    }

    appendLog('system', `Broadcasting market impact: ${symbol} ${direction} for ${minutes} min`, 'system');

    // API Call to Node.js backend
    // Note: This requires the Node.js server to be running (port 5000)
    try {
        const response = await fetch(`${API_BASE}/admin/manipulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.localStorage.getItem('adminToken')}` },
            body: JSON.stringify({ symbol, direction, minutes })
        });
        const data = await response.json();
        appendLog('system', `Market Response: ${data.message}`, 'system');
    } catch (e) {
        appendLog('system', `Market Impact Failed (Server Offline)`, 'error');
    }
}

async function addStock() {
    const symbol = document.getElementById('stock-symbol').value;
    const name = document.getElementById('stock-name').value;
    const price = document.getElementById('stock-price').value;

    if (!symbol || !name || !price) return;

    try {
        const res = await fetch(`${API_BASE}/admin/stock/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.localStorage.getItem('adminToken')}` },
            body: JSON.stringify({ symbol, name, price })
        });
        const data = await res.json();
        appendLog('system', `Stock Added: ${data.message}`, 'system');
        fetchStocks();
    } catch (e) {
        appendLog('system', `Add Stock Failed`, 'error');
    }
}

async function fetchPlatformStats() {
    try {
        const res = await fetch(`${API_BASE}/admin/analytics/platform-stats`, {
            headers: { 'Authorization': `Bearer ${window.localStorage.getItem('adminToken')}` }
        });
        const stats = await res.json();

        // Update Analytics Tab
        if (stats.topStock) {
            appendLog('system', `Hottest Stock Detected: ${stats.topStock.symbol}`, 'system');
        }
    } catch (e) { }
}

// --- Utils ---
let seconds = 0;
setInterval(() => {
    seconds++;
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    document.getElementById('uptime').innerText = `${h}:${m}:${s}`;

    // Fake memory usage for aesthetic
    const mem = (Math.random() * (45 - 40) + 40).toFixed(1);
    document.getElementById('mem-usage').innerText = `${mem} MB`;
}, 1000);
