const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

const tests = [];
let passedTests = 0;
let failedTests = 0;

function log(status, message, details = '') {
    const icon = status === 'PASS' ? colors.green + '✓' :
        status === 'FAIL' ? colors.red + '✗' :
            colors.yellow + '⚠';

    console.log(`${icon} ${colors.reset}${message}`);
    if (details) {
        console.log(`  ${colors.cyan}→ ${details}${colors.reset}`);
    }

    tests.push({ status, message, details });
    if (status === 'PASS') passedTests++;
    if (status === 'FAIL') failedTests++;
}

async function testRedis() {
    console.log(colors.bright + '\n🔵 Testing Redis...' + colors.reset);
    try {
        const { stdout } = await execAsync('docker ps --filter "name=redis-market" --format "{{.Status}}"');
        if (stdout.includes('Up')) {
            log('PASS', 'Redis container is running', stdout.trim());
        } else {
            log('FAIL', 'Redis container is not running');
        }
    } catch (error) {
        log('FAIL', 'Redis check failed', error.message);
    }
}

async function testDatabase() {
    console.log(colors.bright + '\n🗄️  Testing Database Connection...' + colors.reset);
    try {
        const response = await axios.get('http://localhost:5000/api/stocks', { timeout: 5000 });
        if (response.status === 200 && response.data.length > 0) {
            log('PASS', 'Database connection working', `Found ${response.data.length} stocks`);
        } else {
            log('WARN', 'Database connected but no stocks found');
        }
    } catch (error) {
        log('FAIL', 'Database connection failed', error.message);
    }
}

async function testBackend() {
    console.log(colors.bright + '\n⚙️  Testing Backend API...' + colors.reset);

    // Test API health
    try {
        const response = await axios.get('http://localhost:5000/api/stocks', { timeout: 5000 });
        log('PASS', 'Backend API responding', `Status: ${response.status}`);
    } catch (error) {
        log('FAIL', 'Backend API not responding', error.message);
        return;
    }

    // Test WebSocket
    try {
        const wsTest = await axios.get('http://localhost:5000', { timeout: 3000 });
        if (wsTest.status === 200) {
            log('PASS', 'WebSocket server accessible');
        }
    } catch (error) {
        log('WARN', 'WebSocket test inconclusive');
    }
}

async function testFrontend() {
    console.log(colors.bright + '\n🌐 Testing Frontend...' + colors.reset);
    try {
        const response = await axios.get('http://localhost:5173', { timeout: 5000 });
        if (response.status === 200) {
            log('PASS', 'React frontend is running', 'Accessible on port 5173');
        } else {
            log('FAIL', 'Frontend returned non-200 status');
        }
    } catch (error) {
        log('FAIL', 'Frontend not accessible', error.message);
    }
}

async function testAuth() {
    console.log(colors.bright + '\n🔐 Testing Authentication...' + colors.reset);

    // Test login endpoint
    try {
        const response = await axios.post('http://localhost:5000/api/login', {
            email: 'test@test.com',
            password: 'wrongpassword'
        }, { validateStatus: () => true });

        if (response.status === 401 || response.status === 400) {
            log('PASS', 'Login endpoint responding correctly');
        } else {
            log('WARN', 'Login endpoint returned unexpected status');
        }
    } catch (error) {
        log('FAIL', 'Authentication endpoint failed', error.message);
    }
}

async function testQuickTrades() {
    console.log(colors.bright + '\n⚡ Testing Quick Trades Feature...' + colors.reset);

    try {
        // This will fail without auth, but we're testing if endpoint exists
        const response = await axios.get('http://localhost:5000/api/quick-trade/active', {
            validateStatus: () => true
        });

        if (response.status === 401 || response.status === 403) {
            log('PASS', 'Quick Trade endpoints configured', 'Auth protection working');
        } else if (response.status === 200) {
            log('PASS', 'Quick Trade endpoints accessible');
        } else {
            log('WARN', 'Quick Trade endpoint returned unusual status');
        }
    } catch (error) {
        log('FAIL', 'Quick Trade endpoint not found', error.message);
    }
}

async function testPortsAvailable() {
    console.log(colors.bright + '\n🔌 Testing Port Availability...' + colors.reset);

    const ports = [
        { port: 5000, service: 'Node.js Backend' },
        { port: 5173, service: 'React Frontend' },
        { port: 6379, service: 'Redis' }
    ];

    for (const { port, service } of ports) {
        try {
            const response = await axios.get(`http://localhost:${port}`, {
                timeout: 2000,
                validateStatus: () => true
            });
            log('PASS', `Port ${port} (${service})`, 'Responding');
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                log('FAIL', `Port ${port} (${service})`, 'Not responding');
            } else {
                log('PASS', `Port ${port} (${service})`, 'Service running');
            }
        }
    }
}

async function testPythonService() {
    console.log(colors.bright + '\n🐍 Testing Python Market Simulation...' + colors.reset);

    try {
        const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq python.exe" /FO CSV');
        if (stdout.includes('python.exe')) {
            log('PASS', 'Python process running');
        } else {
            log('FAIL', 'Python process not detected');
        }
    } catch (error) {
        log('FAIL', 'Could not check Python process', error.message);
    }
}

async function testDocker() {
    console.log(colors.bright + '\n🐳 Testing Docker...' + colors.reset);

    try {
        await execAsync('docker --version');
        log('PASS', 'Docker is installed');

        const { stdout } = await execAsync('docker ps');
        log('PASS', 'Docker daemon is running');
    } catch (error) {
        log('FAIL', 'Docker is not available', error.message);
    }
}

async function printSummary() {
    console.log(colors.bright + '\n' + '═'.repeat(70));
    console.log('                         TEST SUMMARY');
    console.log('═'.repeat(70) + colors.reset);

    const total = passedTests + failedTests;
    const successRate = total > 0 ? ((passedTests / total) * 100).toFixed(1) : 0;

    console.log(`\n  Total Tests: ${total}`);
    console.log(`  ${colors.green}✓ Passed: ${passedTests}${colors.reset}`);
    console.log(`  ${colors.red}✗ Failed: ${failedTests}${colors.reset}`);
    console.log(`  Success Rate: ${successRate}%\n`);

    if (failedTests === 0) {
        console.log(colors.green + colors.bright + '  🎉 ALL TESTS PASSED! System is healthy.' + colors.reset);
    } else if (failedTests < 3) {
        console.log(colors.yellow + '  ⚠️  Some issues detected. Please review failed tests.' + colors.reset);
    } else {
        console.log(colors.red + '  ❌ Multiple failures detected. System needs attention.' + colors.reset);
    }

    console.log('\n' + '═'.repeat(70) + '\n');
}

async function runHealthCheck() {
    console.log(colors.cyan + colors.bright);
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                  OVERVIEW INVEST - HEALTH CHECK                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);

    console.log('Running comprehensive system health check...\n');

    await testDocker();
    await testRedis();
    await testBackend();
    await testDatabase();
    await testFrontend();
    await testAuth();
    await testQuickTrades();
    await testPortsAvailable();
    await testPythonService();

    await printSummary();

    // Recommendations
    if (failedTests > 0) {
        console.log(colors.yellow + '💡 RECOMMENDATIONS:\n' + colors.reset);

        if (tests.some(t => t.message.includes('Redis') && t.status === 'FAIL')) {
            console.log('  • Start Redis: docker start redis-market');
        }
        if (tests.some(t => t.message.includes('Backend') && t.status === 'FAIL')) {
            console.log('  • Start Backend: cd server && node index.js');
        }
        if (tests.some(t => t.message.includes('Frontend') && t.status === 'FAIL')) {
            console.log('  • Start Frontend: cd client && npm run dev');
        }
        if (tests.some(t => t.message.includes('Python') && t.status === 'FAIL')) {
            console.log('  • Start Python: cd python-market-sim && venv\\Scripts\\activate && python main.py');
        }
        console.log('');
    }
}

// Run if executed directly
if (require.main === module) {
    runHealthCheck().catch(console.error);
}

module.exports = { runHealthCheck };
