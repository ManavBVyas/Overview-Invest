const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Remove the default white menu bar for a more professional look
Menu.setApplicationMenu(null);

let mainWindow;
const activeProcesses = {
    redis: null,
    python: null,
    node: null,
    react: null
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 850,
        frame: true, // Returning to standard Windows frame for "normal" feel
        transparent: false,
        backgroundColor: '#0a0a0e',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets/icon.ico')
    });

    mainWindow.loadFile('index.html');

    // Smooth appearance
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

// --- IPC Handlers for Service Control ---

ipcMain.on('start-service', (event, service) => {
    startService(service, event);
});

function startService(service, event) {
    if (activeProcesses[service]) return;

    const rootDir = "c:\\Overview Invest V5\\TradingApp";
    let cmd, args, cwd;

    switch (service) {
        case 'redis':
            exec('docker start redis-market', (err) => {
                if (err) {
                    exec('docker run -d -p 6379:6379 --name redis-market redis:latest');
                }
                event.reply('service-status', { service: 'redis', status: 'running' });
            });
            return;

        case 'python':
            cwd = path.join(rootDir, 'python-market-sim');
            cmd = `"${path.join(cwd, 'venv', 'Scripts', 'python.exe')}"`;
            args = ['main.py'];
            break;

        case 'node':
            cwd = path.join(rootDir, 'server');
            exec('for /f "tokens=5" %a in (\'netstat -aon ^| findstr :5000\') do taskkill /F /PID %a', () => {
                const proc = spawn('node', ['index.js'], { cwd, shell: true });
                setupProcess(proc, 'node', event);
            });
            return;

        case 'react':
            cwd = path.join(rootDir, 'client');
            cmd = 'npm.cmd';
            args = ['run', 'dev'];
            break;
    }

    if (cmd) {
        const proc = spawn(cmd, args, {
            cwd,
            shell: true,
            env: { ...process.env, PYTHONUTF8: "1" }
        });
        setupProcess(proc, service, event);
    }
}

ipcMain.on('start-all', async (event) => {
    event.reply('service-log', { service: 'system', data: '>>> STARTING ALL SERVICES <<<' });
    startService('redis', event);
    await new Promise(r => setTimeout(r, 2000));
    startService('python', event);
    await new Promise(r => setTimeout(r, 1000));
    startService('node', event);
    await new Promise(r => setTimeout(r, 1000));
    startService('react', event);
});

function setupProcess(proc, service, event) {
    activeProcesses[service] = proc;

    proc.stdout.on('data', (data) => {
        event.reply('service-log', { service, data: data.toString() });
    });

    proc.stderr.on('data', (data) => {
        event.reply('service-log', { service, data: data.toString(), type: 'error' });
    });

    proc.on('close', () => {
        activeProcesses[service] = null;
        event.reply('service-status', { service, status: 'stopped' });
    });

    event.reply('service-status', { service, status: 'running' });
}


ipcMain.on('stop-service', (event, service) => {
    if (service === 'redis') {
        exec('docker stop redis-market');
        event.reply('service-status', { service: 'redis', status: 'stopped' });
    } else if (activeProcesses[service]) {
        // Kill the process tree on Windows
        exec(`taskkill /pid ${activeProcesses[service].pid} /T /F`);
        activeProcesses[service] = null;
        event.reply('service-status', { service, status: 'stopped' });
    }
});

ipcMain.on('app-control', (event, action) => {
    if (action === 'close') app.quit();
    if (action === 'minimize') mainWindow.minimize();
    if (action === 'maximize') {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
    }
    if (action === 'open-website') {
        shell.openExternal('http://localhost:5173');
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    // Kill all child processes on exit
    Object.keys(activeProcesses).forEach(s => {
        if (activeProcesses[s]) {
            try { exec(`taskkill /pid ${activeProcesses[s].pid} /T /F`); } catch (e) { }
        }
    });
    if (process.platform !== 'darwin') app.quit();
});
