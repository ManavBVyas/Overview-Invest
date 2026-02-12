const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    is_active: { type: Boolean, default: true },
    balance: { type: Number, default: 10000.00 },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'English' },
    currency: { type: String, default: 'INR' },
    two_factor: { type: Boolean, default: false },
    holdings: [{
        symbol: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        average_price: { type: Number, default: 0 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

