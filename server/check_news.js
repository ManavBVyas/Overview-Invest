const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkNews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/overview_invest');
        const count = await mongoose.connection.collection('news').countDocuments();
        console.log(`News Count: ${count}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkNews();
