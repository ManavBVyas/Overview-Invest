const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
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
});

const VerificationService = {
  /**
   * Send OTP to the user's email.
   * @param {string} email
   * @returns {Promise}
   */
  async sendOtp(email) {
    try {
      // Generate 6 digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Save to DB
      await Otp.create({ email, otp: code });

      // Send Email
      const mailOptions = {
        from: process.env.SMTP_FROM || '"Overview Invest" <no-reply@overviewinvest.com>',
        to: email,
        subject: 'Overview Invest - Verification Code',
        text: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Verification Code</h2>
            <p>Your verification code for Overview Invest is:</p>
            <h1 style="color: #4CAF50; letter-spacing: 5px;">${code}</h1>
            <p>This code will expire in 5 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
          </div>
        `
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`\n📧 [EMAIL SENT] Message ID: ${info.messageId} | To: ${email} | Code: ${code}\n`);
        return { success: true, message: 'OTP sent successfully' };
      } catch (emailError) {
        console.error("❌ Email sending failed:", emailError.message);
        console.log(`⚠️  [FALLBACK] To: ${email} | Code: ${code} (Check console/DB for code)`);
        return { success: true, message: 'OTP generated (Check Console/Logs if email failed)' };
      }

    } catch (error) {
      console.error('Error in sendOtp flow:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Verify the received OTP.
   * @param {string} email
   * @param {string} code
   * @returns {Promise<Object>}
   */
  async verifyOtp(email, code) {
    try {
      const otpRecord = await Otp.findOne({ email, otp: code });

      if (otpRecord) {
        // Valid OTP
        await Otp.deleteOne({ _id: otpRecord._id }); // Prevent reuse
        return { verified: true, message: 'OTP verified successfully' };
      }

      return { verified: false, message: 'Invalid or expired OTP' };
    } catch (error) {
      console.error('Error verifying OTP:', error.message);
      return { verified: false, message: 'Verification error' };
    }
  },

  /**
   * Generate Premium Invoice PDF and Email it.
   */
  async createInvoice(data) {
    try {
      console.log(`🧾 Generating Premium Invoice for Order #${data.order_id}...`);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const invoicesDir = path.join(__dirname, '..', 'invoices');

      // Ensure directory exists
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir);
      }

      const filename = `invoice_${data.order_id}.pdf`;
      const filePath = path.join(invoicesDir, filename);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Define colors
      const primaryColor = '#38bdf8'; // Sky blue
      const darkColor = '#1e293b'; // Dark slate
      const accentColor = '#22c55e'; // Green
      const textColor = '#334155'; // Slate gray

      // ============ HEADER SECTION ============
      // Top colored bar
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      // Company Name (Logo area)
      doc.fillColor('#ffffff')
        .fontSize(32)
        .font('Helvetica-Bold')
        .text('OVERVIEW INVEST', 50, 35, { align: 'left' });

      doc.fillColor('#e0f2fe')
        .fontSize(11)
        .font('Helvetica')
        .text('Smart Trading Platform', 50, 70, { align: 'left' });

      // Invoice title on the right
      doc.fillColor('#ffffff')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 45, { align: 'right' });

      // Reset position
      doc.fillColor(textColor).font('Helvetica');

      // ============ COMPANY & INVOICE INFO ============
      let currentY = 150;

      // Left side - Company Info
      doc.fontSize(10)
        .fillColor('#64748b')
        .text('FROM:', 50, currentY);

      currentY += 20;
      doc.fontSize(11)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text('Overview Invest Pvt. Ltd.', 50, currentY);

      currentY += 15;
      doc.fontSize(9)
        .fillColor(textColor)
        .font('Helvetica')
        .text('Keshod, Junagadh, Gujarat, India', 50, currentY);

      currentY += 12;
      doc.text('Email: support@overviewinvest.com', 50, currentY);

      currentY += 12;
      doc.text('Phone: +91 63519 41238', 50, currentY);

      // Right side - Invoice Details
      let rightY = 150;
      const rightX = 300; // Moved left to give more space
      const valueX = 420; // Explicit column for values

      doc.fontSize(10)
        .fillColor('#64748b')
        .text('INVOICE DETAILS:', rightX, rightY);

      rightY += 20;
      doc.fontSize(9)
        .fillColor(textColor)
        .font('Helvetica-Bold')
        .text('Invoice Number:', rightX, rightY);

      // Handle potentially long ID
      doc.font('Helvetica')
        .text(`${data.order_id}`, valueX, rightY, { width: 130, align: 'right' });

      rightY += 15;
      doc.font('Helvetica-Bold')
        .text('Date:', rightX, rightY);
      doc.font('Helvetica')
        .text(new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }), valueX, rightY, { width: 130, align: 'right' });

      rightY += 15;
      doc.font('Helvetica-Bold')
        .text('Status:', rightX, rightY);
      doc.fillColor(accentColor)
        .text('PAID', valueX, rightY, { width: 130, align: 'right' });

      // ============ CUSTOMER INFO ============
      currentY = 270;

      // Divider line
      doc.strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, currentY - 10)
        .lineTo(doc.page.width - 50, currentY - 10)
        .stroke();

      doc.fontSize(10)
        .fillColor('#64748b')
        .text('BILL TO:', 50, currentY);

      currentY += 20;
      doc.fontSize(12)
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .text(data.username || data.email?.split('@')[0] || 'Customer', 50, currentY);

      currentY += 18;
      doc.fontSize(9)
        .fillColor(textColor)
        .font('Helvetica')
        .text(`Email: ${data.email}`, 50, currentY);

      // ============ ITEMS TABLE ============
      currentY = 370;

      // Table header background
      doc.rect(50, currentY, doc.page.width - 100, 30)
        .fill('#f1f5f9');

      // Table headers
      doc.fillColor(darkColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 60, currentY + 10, { width: 200 })
        .text('QTY', 280, currentY + 10, { width: 50, align: 'center' })
        .text('PRICE', 350, currentY + 10, { width: 80, align: 'right' })
        .text('AMOUNT', 450, currentY + 10, { width: 90, align: 'right' });

      currentY += 35;

      // Exchange Rate (Approximate)
      const EXCHANGE_RATE = 87.50; // USD to INR
      const isINR = data.currency === 'INR';
      const multiplier = isINR ? 1 : EXCHANGE_RATE;

      // Table items
      let subtotal = 0;
      doc.font('Helvetica').fillColor(textColor).fontSize(9);

      data.items.forEach((item, index) => {
        const qty = parseFloat(item.quantity || 1);
        let price = parseFloat(item.price || 0);

        // Convert to INR if needed
        price = price * multiplier;

        const total = qty * price;
        subtotal += total;

        // Alternating row background
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, doc.page.width - 100, 25)
            .fill('#fafafa');
        }

        doc.fillColor(textColor)
          .text(item.name || item.description || 'Item', 60, currentY, { width: 200 })
          .text(qty.toString(), 280, currentY, { width: 50, align: 'center' })
          .text(`Rs. ${price.toFixed(2)}`, 350, currentY, { width: 80, align: 'right' })
          .text(`Rs. ${total.toFixed(2)}`, 450, currentY, { width: 90, align: 'right' });

        currentY += 25;
      });

      // Divider before totals
      currentY += 10;
      doc.strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(doc.page.width - 50, currentY)
        .stroke();

      // Totals section
      currentY += 20;

      // Subtotal
      doc.fontSize(10)
        .fillColor(textColor)
        .font('Helvetica')
        .text('Subtotal:', 400, currentY, { width: 90, align: 'left' })
        .text(`Rs. ${subtotal.toFixed(2)}`, 450, currentY, { width: 90, align: 'right' });

      currentY += 20;

      // Tax (if applicable)
      const tax = subtotal * 0; // 0% tax for now
      if (tax > 0) {
        doc.text('Tax (18%):', 400, currentY, { width: 90, align: 'left' })
          .text(`Rs. ${tax.toFixed(2)}`, 450, currentY, { width: 90, align: 'right' });
        currentY += 20;
      }

      // Total - highlighted
      // Recalculate totalAmount strictly from subtotal + tax to ensure consistency with invoice items
      const totalAmount = subtotal + tax;

      doc.rect(350, currentY - 5, 195, 35)
        .fill(primaryColor);

      doc.fontSize(14)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('TOTAL:', 360, currentY + 5, { width: 90, align: 'left' })
        .text(`Rs. ${totalAmount.toFixed(2)}`, 450, currentY + 5, { width: 90, align: 'right' });

      // ============ FOOTER ============
      const footerY = doc.page.height - 100;

      // Footer divider
      doc.strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, footerY)
        .lineTo(doc.page.width - 50, footerY)
        .stroke();

      // Thank you message
      doc.fontSize(11)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Thank you for your business!', 50, footerY + 15, { align: 'center' });

      doc.fontSize(8)
        .fillColor('#64748b')
        .font('Helvetica')
        .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 35, { align: 'center' });

      doc.text('For any queries, contact us at support@overviewinvest.com', 50, footerY + 48, { align: 'center' });

      // Page number
      doc.fontSize(8)
        .fillColor('#94a3b8')
        .text(`Page 1 of 1`, 50, doc.page.height - 30, { align: 'center' });

      doc.end();

      // Wait for PDF to finish writing before sending
      stream.on('finish', async () => {
        console.log(`✅ Premium Invoice PDF created: ${filePath}`);

        // Send Email with Attachment
        const mailOptions = {
          from: process.env.SMTP_FROM || '"Overview Invest" <no-reply@overviewinvest.com>',
          to: data.email,
          subject: `Invoice #${data.order_id} - Overview Invest`,
          text: `Thank you for your purchase! Please find your invoice attached for Order #${data.order_id}.`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%); padding: 40px 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
                .content { padding: 40px 30px; }
                .invoice-details { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .invoice-details table { width: 100%; border-collapse: collapse; }
                .invoice-details td { padding: 8px 0; font-size: 14px; }
                .invoice-details td:first-child { color: #64748b; font-weight: 500; }
                .invoice-details td:last-child { text-align: right; font-weight: 600; color: #1e293b; }
                .total { background: #38bdf8; color: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                .total .amount { font-size: 32px; font-weight: bold; margin: 10px 0; }
                .button { display: inline-block; background: #38bdf8; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 12px; }
                .footer a { color: #38bdf8; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Payment Successful!</h1>
                  <p>Thank you for your purchase</p>
                </div>
                <div class="content">
                  <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">Dear ${data.username || 'Valued Customer'},</p>
                  <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
                    We're pleased to confirm that your payment has been successfully processed. Your invoice is attached to this email for your records.
                  </p>
                  
                  <div class="invoice-details">
                    <table>
                      <tr>
                        <td>Invoice Number</td>
                        <td>#${data.order_id}</td>
                      </tr>
                      <tr>
                        <td>Date</td>
                        <td>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      </tr>
                      <tr>
                        <td>Payment Method</td>
                        <td>Online Payment</td>
                      </tr>
                      <tr>
                        <td>Status</td>
                        <td style="color: #22c55e;">✓ Paid</td>
                      </tr>
                    </table>
                  </div>

                  <div class="total">
                    <div style="font-size: 14px; opacity: 0.9;">Total Amount Paid</div>
                    <div class="amount">Rs. ${parseFloat(totalAmount).toFixed(2)}</div>
                  </div>

                  <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 30px;">
                    If you have any questions about this invoice, please don't hesitate to contact our support team.
                  </p>

                  <center>
                    <a href="mailto:overviewinvest.dev@gmail.com" class="button">Contact Support</a>
                  </center>
                </div>
                <div class="footer">
                  <p><strong>Overview Invest Pvt. Ltd.</strong></p>
                  <p>Keshod, Junagadh, Gujarat, India</p>
                  <p>Email: <a href="mailto:overviewinvest.dev@gmail.com">overviewinvest.dev@gmail.com</a> | Phone: +91 63519 41238</p>
                  <p style="margin-top: 20px; font-size: 11px; color: #94a3b8;">
                    This is an automated email. Please do not reply to this message.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments: [
            {
              filename: filename,
              path: filePath
            }
          ]
        };

        try {
          const info = await transporter.sendMail(mailOptions);
          console.log(`\n📧 [PREMIUM INVOICE SENT] Message ID: ${info.messageId} | To: ${data.email}\n`);
        } catch (emailError) {
          console.error("❌ Invoice email failed:", emailError.message);
        }
      });

      return { success: true, message: 'Premium invoice processing started' };

    } catch (error) {
      console.error('Error creating invoice:', error.message);
      return { success: false, error: error.message };
    }
  }
};


module.exports = VerificationService;
