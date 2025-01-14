const nodemailer = require('nodemailer');
const { getTopUpEmailTemplate } = require('./emailTemplates');

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,  // Changed to 465 for secure connection
    secure: true, // Use SSL/TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.APP_PASSWORD  // Using APP_PASSWORD instead of SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // Accept self-signed certificates
    }
});

// Verify transporter connection at startup
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log('Email service is ready to send emails');
        return true;
    } catch (error) {
        console.error('Email service configuration error:', error);
        return false;
    }
};

const sendTopUpNotification = async (transaction) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: transaction.customerEmail,
            subject: `Top-up Confirmation - ${transaction.currency} ${transaction.amount}`,
            html: getTopUpEmailTemplate(transaction)
        });
    } catch (error) {
        console.error('Error sending top-up notification:', error);
        throw error;
    }
};

// Add the sendCardOrderNotification function
const sendCardOrderNotification = async (order) => {
    try {
        // For now, just log the notification
        console.log('Sending card order notification:', {
            orderId: order._id,
            cardType: order.cardType,
            amount: order.amount,
            currency: order.currency,
            customerEmail: order.customerEmail,
            status: order.status
        });
        
        // TODO: Implement actual email sending logic
        // Similar to sendTopUpNotification but with card order specific template
        
        return true;
    } catch (error) {
        console.error('Failed to send card order notification:', error);
        // Don't throw error to prevent blocking the payment flow
        return false;
    }
};

// Verify connection when the module is loaded
verifyConnection();

module.exports = {
    sendTopUpNotification,
    sendCardOrderNotification,
    verifyConnection
}; 