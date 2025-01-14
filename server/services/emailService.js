const nodemailer = require('nodemailer');
const generateReceipt = require('../utils/receiptGenerator');

// Create reusable transporter with Gmail settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    debug: true,
    logger: true
});

async function sendReceiptEmail(order) {
    try {
        console.log('Starting email process for order:', {
            orderId: order._id,
            customerEmail: order.user.email,
            customerName: order.user.name
        });

        // Test SMTP connection before sending
        await transporter.verify();
        console.log('SMTP connection verified');

        console.log('Generating receipt...');
        const receiptBuffer = generateReceipt(order);
        console.log('Receipt generated successfully');

        const mailOptions = {
            from: {
                name: 'Virtual Card Services Africa',
                address: process.env.SMTP_USER
            },
            to: order.user.email,
            replyTo: process.env.SMTP_USER,
            subject: 'Your Virtual Card Purchase Receipt',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0066cc;">Thank You for Your Purchase!</h2>
                    <p>Dear ${order.user.name},</p>
                    <p>Your payment has been successfully processed. Please find your receipt attached to this email.</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Order Details:</strong></p>
                        <p style="margin: 5px 0;">Transaction ID: ${order.transaction_id || order.reference}</p>
                        <p style="margin: 5px 0;">Amount: ${order.amount} ${order.currency || 'XAF'}</p>
                        <p style="margin: 5px 0;">Card Type: ${order.cardType}</p>
                        <p style="margin: 5px 0;">Payment Method: ${order.paymentMethod}</p>
                    </div>
                    <p>If you have any questions, please don't hesitate to contact our support team.</p>
                    <p style="color: #666;">Best regards,<br>Virtual Card Services Africa</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'receipt.pdf',
                    content: receiptBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        // Log the full mail options (excluding sensitive data)
        console.log('Mail options prepared:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            hasAttachments: !!mailOptions.attachments.length
        });

        // Send mail with explicit promise handling
        const info = await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Send mail error:', error);
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });

        console.log('Email sent successfully:', {
            messageId: info.messageId,
            response: info.response,
            accepted: info.accepted,
            rejected: info.rejected,
            envelope: info.envelope
        });

        return true;
    } catch (error) {
        console.error('Email sending failed:', {
            error: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command,
            response: error.response
        });
        
        if (error.code === 'EAUTH') {
            console.error('Authentication failed - Check your Gmail app password');
        } else if (error.code === 'ESOCKET') {
            console.error('Socket error - Check your network connection and Gmail settings');
        }

        return false;
    }
}

// Initial SMTP verification
console.log('Verifying initial SMTP configuration...');
transporter.verify()
    .then(() => {
        console.log('SMTP connection successful. Email service is ready.');
        console.log('Email configuration:', {
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            user: process.env.SMTP_USER
        });
    })
    .catch((error) => {
        console.error('Initial SMTP verification failed:', {
            error: error.message,
            code: error.code,
            command: error.command
        });
    });

module.exports = { sendReceiptEmail }; 