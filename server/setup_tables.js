const { pool } = require('./db');

const setup = async () => {
    const client = await pool.connect();
    try {
        console.log("Checking tables...");

        // Drop to ensure clean state if schema changed (optional, but good for "proper" reset if user agrees. 
        // I won't drop data, just ensure exists)

        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Users table OK");

        await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        balance DECIMAL(15, 2) DEFAULT 10000.00,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Wallets table OK");

        await client.query(`
      CREATE TABLE IF NOT EXISTS holdings (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(10) NOT NULL,
        quantity INTEGER DEFAULT 0,
        average_price DECIMAL(10, 2) DEFAULT 0.00,
        PRIMARY KEY (user_id, symbol)
      );
    `);
        console.log("Holdings table OK");

        await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(10) NOT NULL,
        type VARCHAR(4) CHECK (type IN ('BUY', 'SELL')),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Transactions table OK");

    } catch (err) {
        console.error("Setup Error:", err);
    } finally {
        client.release();
        pool.end();
    }
};

setup();
