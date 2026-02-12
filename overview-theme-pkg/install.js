const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'index.css');
const target = path.join(process.cwd(), 'src', 'index.css');

if (!fs.existsSync(path.join(process.cwd(), 'src'))) {
    console.error('Error: ./src directory not found. Please run this script from the root of a Vite/React project.');
    process.exit(1);
}

try {
    fs.copyFileSync(source, target);
    console.log('✅ Successfully installed Overview Invest Theme to ./src/index.css');
    console.log('   Make sure to import it in main.jsx: import "./index.css"');
} catch (err) {
    console.error('Error copying file:', err);
}
