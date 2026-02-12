const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    debug: false,
    logger: false
});

async function verifyConnection() {
    console.log('🔍 Testing SMTP Connection...');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`User: ${process.env.SMTP_USER}`);

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection established successfully!');

        console.log('📧 Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Overview Invest - Test Email',
            text: 'If you are reading this, your email configuration is working perfectly!',
        });

        console.log('✅ Message sent: %s', info.messageId);
    } catch (error) {
        console.error('❌ Connection/Auth Error:', error);

        if (error.code === 'EAUTH') {
            console.log('\n💡 TIP: Check your username and password.');
            console.log('   If using Gmail, make sure you are using an "App Password", not your login password.');
        }
    }
}

verifyConnection();
