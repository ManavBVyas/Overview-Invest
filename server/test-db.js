const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Testing DB Connection...");
console.log("Host:", process.env.DB_HOST);
console.log("Port:", process.env.DB_PORT);
console.log("User:", process.env.DB_USER);

const pool = new Pool({
    host: "aws-1-ap-northeast-2.pooler.supabase.com",
    port: 6543,
    database: process.env.DB_NAME,
    user: "postgres.coqiegzkdcollxmbfdxg",
    password: process.env.DB_PASS,
    ssl: { rejectUnauthorized: false },
    prepare_threshold: 0
});

async function test() {
    try {
        const client = await pool.connect();
        console.log("Successfully connected!");

        // Test a basic query
        const res = await client.query('SELECT NOW()');
        console.log("Time from DB:", res.rows[0]);

        // Test Table Creation (simulating initDb)
        await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50)
      );
    `);
        console.log("Test table created/checked.");

        // Test Insert (simulating Register)
        // This uses parameterized query which might fail on transaction pooler
        await client.query('INSERT INTO test_table (name) VALUES ($1)', ['Test User']);
        console.log("Insert successful (Prepared Statement worked).");

        client.release();
        pool.end();
    } catch (err) {
        console.error("DB Error:", err);
        pool.end();
    }
}

test();
