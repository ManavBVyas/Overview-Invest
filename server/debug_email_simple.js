const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

transporter.verify().then(() => {
    console.log("RESULT: SUCCESS");
    process.exit(0);
}).catch((err) => {
    console.log("RESULT: FAILURE - " + err.message);
    process.exit(1);
});
