const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const check = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest';
        console.log(`🔌 Connecting to: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Shield password

        await mongoose.connect(uri);
        console.log('✅ Connected');

        const collections = await mongoose.connection.db.collections();

        console.log('\n📊 Database Counts:');
        console.log('-------------------');
        let hasData = false;

        for (let collection of collections) {
            const count = await collection.countDocuments();
            console.log(`${collection.collectionName}: ${count}`);
            if (count > 0) hasData = true;
        }
        console.log('-------------------');

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

check();
