const { initDb, pool } = require('./db');

const run = async () => {
    try {
        console.log("🚀 Starting database initialization and re-seeding...");
        await initDb();
        console.log("✅ Re-seeding complete.");
    } catch (err) {
        console.error("❌ Failed to re-seed:", err);
    } finally {
        await pool.end();
    }
};

run();
