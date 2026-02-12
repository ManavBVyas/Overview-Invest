const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Debugging Email Configuration...');
console.log(`SMTP_HOST: '${process.env.SMTP_HOST}'`);
console.log(`SMTP_USER: '${process.env.SMTP_USER}'`);

const pass = process.env.SMTP_PASS || '';
const passLength = pass.length;
console.log(`SMTP_PASS Length: ${passLength}`);
console.log(`SMTP_PASS First 4 chars: '${pass.substring(0, 4)}'`);
console.log(`SMTP_PASS Contains Spaces: ${pass.includes(' ')}`);

// Create reusable transporter object
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true
});

async function verify() {
    try {
        console.log('\n📡 Verifying SMTP Connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('\n📧 Sending Test Email...');
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER,
            subject: 'Debug Email Test',
            text: 'This is a test email to verify credentials.',
        });
        console.log('✅ Test Email Sent!');
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.code === 'EAUTH') {
            console.log('\n💡 TIP: Authentication failed. Try removing spaces from the generated app password in the .env file.');
        }
    }
}

verify();
