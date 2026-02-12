const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    created_at: { type: Date, default: Date.now, expires: 300 } // Expires in 5 minutes (300 seconds)
});

// Index for faster lookups
OtpSchema.index({ email: 1 });

module.exports = mongoose.model('Otp', OtpSchema);
