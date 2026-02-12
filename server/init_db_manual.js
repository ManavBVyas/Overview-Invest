const { initDb, pool } = require('./db');
const dotenv = require('dotenv');
dotenv.config();

console.log('Running manual DB initialization...');
initDb().then(() => {
    console.log('Manual initDb verified/completed.');
    pool.end();
}).catch(err => {
    console.error('Manual initDb failed:', err);
    pool.end();
});
