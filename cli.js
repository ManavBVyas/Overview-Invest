#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const readline = require('readline');
const path = require('path');
const Table = require('cli-table3');

// ANSI color codes
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Color helper functions
const chalk = {
    green: (text) => c.green + text + c.reset,
    red: (text) => c.red + text + c.reset,
    yellow: (text) => c.yellow + text + c.reset,
    blue: (text) => c.blue + text + c.reset,
    cyan: (text) => c.cyan + text + c.reset,
    magenta: (text) => c.magenta + text + c.reset,
    bold: (text) => c.bold + text + c.reset,
    'green.bold': (text) => c.green + c.bold + text + c.reset,
    'bold.green': (text) => c.bold + c.green + text + c.reset,
    'cyan.bold': (text) => c.cyan + c.bold + text + c.reset,
    'magenta.bold': (text) => c.magenta + c.bold + text + c.reset,
    'red.bold': (text) => c.red + c.bold + text + c.reset,
    'yellow.bold': (text) => c.yellow + c.bold + text + c.reset,
    'blue.bold': (text) => c.blue + c.bold + text + c.reset
};

// Running processes
const processes = {
    redis: null,
    python: null,
    node: null,
    react: null
};

// Clear console
function clearScreen() {
    console.clear();
}

// Print header
function printHeader() {
    console.log('');
    console.log(chalk['green.bold']('╔════════════════════════════════════════════════════════════════════╗'));
    console.log(chalk['green.bold']('║') + chalk['green.bold']('              OVERVIEW INVEST V5 - SERVICE MANAGER CLI              ') + chalk['green.bold']('║'));
    console.log(chalk['green.bold']('╚════════════════════════════════════════════════════════════════════╝'));
}

// Print service status with beautiful table
function printStatus() {
    console.log(chalk['green.bold']('\n📊 SERVICE STATUS:\n'));

    const services = [
        { name: 'Redis (Database)', key: 'redis', port: '6379' },
        { name: 'Python Market Sim', key: 'python', port: 'N/A' },
        { name: 'Node.js Backend', key: 'node', port: '5000' },
        { name: 'React Frontend', key: 'react', port: '5173' }
    ];

    const table = new Table({
        head: [
            chalk.bold('STATUS'),
            chalk.bold('SERVICE'),
            chalk.bold('PORT'),
            chalk.bold('HEALTH')
        ],
        style: {
            head: [],
            border: ['green']
        },
        colWidths: [13, 26, 11, 13]
    });

    services.forEach(service => {
        const isRunning = processes[service.key];
        const status = isRunning ?
            chalk.green('● RUNNING') :
            chalk.red('○ STOPPED');

        const health = isRunning ?
            chalk.cyan('✓ Active') :
            chalk.yellow('✗ Down');

        table.push([status, service.name, service.port, health]);
    });

    console.log(table.toString());
    console.log('');
}

// Print menu with boxes
function printMenu() {
    const menuTable = new Table({
        style: {
            head: [],
            border: ['green']
        },
        colWidths: [68]
    });

    menuTable.push(
        [{ content: chalk.bold('⚡ COMMANDS'), hAlign: 'center' }],
        [''],
        [chalk['cyan.bold']('  SERVICE CONTROL')],
        ['    ' + chalk.cyan('1') + '. Start All Services        ' + chalk.cyan('2') + '. Stop All Services'],
        ['    ' + chalk.cyan('3') + '. Start Redis              ' + chalk.cyan('7') + '. Stop Redis'],
        ['    ' + chalk.cyan('4') + '. Start Python             ' + chalk.cyan('8') + '. Stop Python'],
        ['    ' + chalk.cyan('5') + '. Start Node.js             ' + chalk.cyan('9') + '. Stop Node.js'],
        ['    ' + chalk.cyan('6') + '. Start React              ' + chalk.cyan('10') + '. Stop React'],
        [''],
        [chalk['magenta.bold']('  TOOLS & UTILITIES')],
        ['    ' + chalk.yellow('r') + '. Restart All              ' + chalk.magenta('d') + '. Run Database Migration'],
        ['    ' + chalk.magenta('c') + '. Cleanup Price History    ' + chalk.cyan('h') + '. Run Health Check'],
        ['    ' + chalk.blue('l') + '. View Service Logs        ' + chalk.red('q') + '. Quit & Stop All']
    );

    console.log(menuTable.toString());
    console.log('');
}

async function startRedis() {
    return new Promise((resolve, reject) => {
        console.log(chalk.yellow('⏳ Starting Redis...'));
        exec('docker start redis-market', (error) => {
            if (error) {
                exec('docker run -d -p 6379:6379 --name redis-market redis:latest', (err) => {
                    if (err) {
                        console.log(chalk.red('❌ Failed to start Redis'));
                        reject(err);
                    } else {
                        processes.redis = true;
                        console.log(chalk.green('✅ Redis started on port 6379'));
                        resolve();
                    }
                });
            } else {
                processes.redis = true;
                console.log(chalk.green('✅ Redis started on port 6379'));
                resolve();
            }
        });
    });
}

async function stopRedis() {
    return new Promise((resolve) => {
        console.log(chalk.yellow('⏳ Stopping Redis...'));
        exec('docker stop redis-market', (error) => {
            processes.redis = null;
            if (error) {
                console.log(chalk.yellow('⚠️  Redis was not running'));
            } else {
                console.log(chalk.green('✅ Redis stopped'));
            }
            resolve();
        });
    });
}

function startPython() {
    if (processes.python) {
        console.log(chalk.yellow('⚠️  Python already running'));
        return;
    }

    console.log(chalk.yellow('⏳ Starting Python Market Sim...'));

    const pythonDir = path.join(process.cwd(), 'python-market-sim');
    const pythonPath = path.join(pythonDir, 'venv', 'Scripts', 'python.exe');

    processes.python = spawn(pythonPath, ['main.py'], {
        cwd: pythonDir,
        stdio: 'pipe'
    });

    processes.python.stdout.on('data', (data) => {
        console.log(chalk.blue('[Python] ') + data.toString().trim());
    });

    processes.python.stderr.on('data', (data) => {
        console.log(chalk.red('[Python Error] ') + data.toString().trim());
    });

    processes.python.on('close', (code) => {
        processes.python = null;
        console.log(chalk.yellow(`Python service stopped (code ${code})`));
    });

    console.log(chalk.green('✅ Python Market Sim started'));
}

function startNode() {
    if (processes.node) {
        console.log(chalk.yellow('⚠️  Node.js already running'));
        return;
    }

    console.log(chalk.yellow('⏳ Starting Node.js Backend...'));

    const serverDir = path.join(process.cwd(), 'server');

    processes.node = spawn('node', ['index.js'], {
        cwd: serverDir,
        stdio: 'pipe'
    });

    processes.node.stdout.on('data', (data) => {
        console.log(chalk.green('[Node] ') + data.toString().trim());
    });

    processes.node.stderr.on('data', (data) => {
        console.log(chalk.red('[Node Error] ') + data.toString().trim());
    });

    processes.node.on('close', (code) => {
        processes.node = null;
        console.log(chalk.yellow(`Node.js service stopped (code ${code})`));
    });

    console.log(chalk.green('✅ Node.js Backend started on port 5000'));
}

function startReact() {
    if (processes.react) {
        console.log(chalk.yellow('⚠️  React already running'));
        return;
    }

    console.log(chalk.yellow('⏳ Starting React Frontend...'));

    const clientDir = path.join(process.cwd(), 'client');

    processes.react = spawn('npm', ['run', 'dev'], {
        cwd: clientDir,
        stdio: 'pipe',
        shell: true
    });

    processes.react.stdout.on('data', (data) => {
        console.log(chalk.cyan('[React] ') + data.toString().trim());
    });

    processes.react.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg.includes('error') || msg.includes('Error')) {
            console.log(chalk.red('[React Error] ') + msg);
        } else {
            console.log(chalk.cyan('[React] ') + msg);
        }
    });

    processes.react.on('close', (code) => {
        processes.react = null;
        console.log(chalk.yellow(`React service stopped (code ${code})`));
    });

    console.log(chalk.green('✅ React Frontend started on port 5173'));
}

function stopPython() {
    if (processes.python) {
        console.log(chalk.yellow('⏳ Stopping Python...'));
        processes.python.kill();
        processes.python = null;
        console.log(chalk.green('✅ Python stopped'));
    } else {
        console.log(chalk.yellow('⚠️  Python was not running'));
    }
}

function stopNode() {
    if (processes.node) {
        console.log(chalk.yellow('⏳ Stopping Node.js...'));
        processes.node.kill();
        processes.node = null;
        console.log(chalk.green('✅ Node.js stopped'));
    } else {
        console.log(chalk.yellow('⚠️  Node.js was not running'));
    }
}

function stopReact() {
    if (processes.react) {
        console.log(chalk.yellow('⏳ Stopping React...'));
        processes.react.kill();
        processes.react = null;
        console.log(chalk.green('✅ React stopped'));
    } else {
        console.log(chalk.yellow('⚠️  React was not running'));
    }
}

async function startAll() {
    console.log(chalk.bold('\n🚀 Starting all services...\n'));

    await startRedis();
    await new Promise(resolve => setTimeout(resolve, 2000));

    startPython();
    await new Promise(resolve => setTimeout(resolve, 2000));

    startNode();
    await new Promise(resolve => setTimeout(resolve, 2000));

    startReact();

    console.log(chalk['green.bold']('\n✨ All services started!\n'));
}

async function stopAll() {
    console.log(chalk.bold('\n🛑 Stopping all services...\n'));

    stopReact();
    stopNode();
    stopPython();
    await stopRedis();

    console.log(chalk.green('\n✅ All services stopped\n'));
}

function runMigration() {
    console.log(chalk.yellow('\n⏳ Running database migration...\n'));

    const migrationProcess = spawn('node', ['run_quick_trade_migration.js'], {
        cwd: path.join(process.cwd(), 'server'),
        stdio: 'inherit'
    });

    migrationProcess.on('close', () => {
        console.log('');
        promptUser();
    });
}

function cleanupHistory() {
    console.log(chalk.yellow('\n⏳ Cleaning up price history...\n'));

    const cleanupProcess = spawn('node', ['cleanup_price_history.js'], {
        cwd: path.join(process.cwd(), 'server'),
        stdio: 'inherit'
    });

    cleanupProcess.on('close', () => {
        console.log('');
        promptUser();
    });
}

function viewLogs() {
    clearScreen();
    printHeader();
    console.log(chalk.bold('📋 SERVICE LOGS (Ctrl+C to return)\n'));
    console.log('Press any key to return to menu...');
}

function runHealthCheck() {
    console.log(chalk.yellow('\n⏳ Running system health check...\n'));

    const healthCheckProcess = spawn('node', ['health-check.js'], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });

    healthCheckProcess.on('close', () => {
        console.log('');
        promptUser();
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function promptUser() {
    clearScreen();
    printHeader();
    printStatus();
    printMenu();

    rl.question(chalk['bold.green']('> '), async (answer) => {
        const choice = answer.trim().toLowerCase();

        switch (choice) {
            case '1':
                await startAll();
                break;
            case '2':
                await stopAll();
                break;
            case '3':
                await startRedis();
                break;
            case '4':
                startPython();
                break;
            case '5':
                startNode();
                break;
            case '6':
                startReact();
                break;
            case '7':
                await stopRedis();
                break;
            case '8':
                stopPython();
                break;
            case '9':
                stopNode();
                break;
            case '10':
                stopReact();
                break;
            case 'r':
                await stopAll();
                await new Promise(resolve => setTimeout(resolve, 2000));
                await startAll();
                break;
            case 'd':
                runMigration();
                return;
            case 'c':
                cleanupHistory();
                return;
            case 'h':
                runHealthCheck();
                return;
            case 'l':
                viewLogs();
                break;
            case 'q':
                console.log(chalk.yellow('\n👋 Stopping all services...\n'));
                await stopAll();
                console.log(chalk.green('✅ Goodbye!\n'));
                rl.close();
                process.exit(0);
                return;
            default:
                console.log(chalk.red('\n❌ Invalid choice\n'));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        promptUser();
    });
}

process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n\n👋 Caught interrupt signal, stopping all services...\n'));
    await stopAll();
    process.exit(0);
});

console.log(chalk.green('🚀 Initializing Overview Invest Service Manager...\n'));
setTimeout(() => {
    promptUser();
}, 500);
