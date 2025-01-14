const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
const fs = require('fs').promises;
const path = require('path');

// Configure email transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Email transporter verification failed:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Move this function to the top level, before any other functions
const getTransactionIdDisplay = (transactionId) => {
    if (!transactionId) return 'N/A';
    if (transactionId === 'Pending') return 'N/A';
    return transactionId;
};

// Add language mapping for countries
const COUNTRY_LANGUAGES = {
    'CM': 'fr', // Cameroon - French
    'SN': 'fr', // Senegal - French
    'BF': 'fr', // Burkina Faso - French
    'CI': 'fr', // Côte d'Ivoire - French
    'RW': 'en', // Rwanda - English
    'UG': 'en', // Uganda - English
    'default': 'en' // Default to English
};

// Add translations
const translations = {
    en: {
        receipt: 'Payment Receipt',
        date: 'Date',
        customerInfo: 'Customer Information',
        fullName: 'Full Name',
        phone: 'Phone Number',
        country: 'Country',
        transactionDetails: 'Transaction Details',
        cardType: 'Card Type',
        amountLocal: 'Amount (Local)',
        amountUSD: 'Amount (USD)',
        paymentMethod: 'Payment Method',
        reference: 'Reference',
        transactionId: 'Transaction ID',
        thankYou: 'Thank you for your purchase!',
        cardDetails: 'Your virtual card details will be sent in a separate email.',
        autoGenerated: 'This is an automatically generated receipt',
        resent: '(Resent)'
    },
    fr: {
        receipt: 'Reçu de Paiement',
        date: 'Date',
        customerInfo: 'Informations Client',
        fullName: 'Nom Complet',
        phone: 'Numéro de Téléphone',
        country: 'Pays',
        transactionDetails: 'Détails de la Transaction',
        cardType: 'Type de Carte',
        amountLocal: 'Montant (Local)',
        amountUSD: 'Montant (USD)',
        paymentMethod: 'Mode de Paiement',
        reference: 'Référence',
        transactionId: 'ID de Transaction',
        thankYou: 'Merci pour votre achat!',
        cardDetails: 'Les détails de votre carte virtuelle seront envoyés dans un email séparé.',
        autoGenerated: 'Ceci est un reçu généré automatiquement',
        resent: '(Renvoyé)'
    }
};

const generatePDFReceipt = async (name, orderDetails) => {
    const doc = new jsPDF();
    
    try {
        // Determine language based on country
        const lang = COUNTRY_LANGUAGES[orderDetails.country] || COUNTRY_LANGUAGES.default;
        const t = translations[lang];
        
        // Ensure all text inputs are strings and not undefined/null
        const safeText = (text) => String(text || 'N/A');
        
        // Add background color and design elements
        doc.setFillColor(247, 250, 252);
        doc.rect(0, 0, 210, 297, 'F');
        
        // Add header with logo placeholder
        doc.setFillColor(26, 54, 93);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Add white text for header
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text(t.receipt, 105, 25, { align: 'center' });
        
        // Format date according to locale
        let formattedDate;
        try {
            formattedDate = new Date(orderDetails.paymentDate).toLocaleString(
                lang === 'fr' ? 'fr-FR' : 'en-US',
                {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                }
            );
        } catch (error) {
            formattedDate = new Date().toLocaleString();
        }

        doc.setFontSize(12);
        doc.text(`${t.date}: ${formattedDate}`, 105, 35, { align: 'center' });

        // Customer Information Section
        doc.setTextColor(45, 55, 72);
        doc.setFontSize(16);
        doc.text(t.customerInfo, 20, 60);
        
        // Add rounded rectangle for customer info
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, 65, 180, 50, 3, 3, 'F');
        
        // Add customer details with translations
        doc.setFontSize(12);
        doc.text(`${t.fullName}:`, 25, 80);
        doc.text(safeText(name), 80, 80);
        
        doc.text(`${t.phone}:`, 25, 90);
        doc.text(safeText(orderDetails.phone), 80, 90);
        
        doc.text(`${t.country}:`, 25, 100);
        doc.text(safeText(orderDetails.country), 80, 100);

        // Transaction Details Section
        doc.setFontSize(16);
        doc.text(t.transactionDetails, 20, 130);
        
        // Add rounded rectangle for transaction details
        doc.roundedRect(15, 135, 180, 100, 3, 3, 'F');
        
        // Ensure numbers are valid
        const amount = parseFloat(orderDetails.amount) || 0;
        const usdAmount = parseFloat(orderDetails.amountUSD) || amount / 650 || 0;
        
        // Add transaction details with proper spacing and alignment
        doc.setFontSize(12);
        const transactionDetails = [
            [t.cardType, safeText(orderDetails.cardType), 150],
            [t.amountLocal, `${amount.toFixed(2)} ${safeText(orderDetails.currency)}`, 165],
            [t.amountUSD, `$${usdAmount.toFixed(2)} USD`, 180],
            [t.paymentMethod, safeText(orderDetails.paymentMethod), 195],
            [t.reference, safeText(orderDetails.reference), 210],
            [t.transactionId, safeText(orderDetails.transactionId), 225]
        ];

        transactionDetails.forEach(([label, value, y]) => {
            if (label && value && y) {
                doc.text(String(label), 25, y);
                doc.text(String(value), 80, y);
            }
        });

        // Add footer
        const footerY = 260;
        doc.setFillColor(26, 54, 93);
        doc.rect(0, footerY - 10, 210, 47, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('Virtual Services', 105, footerY + 5, { align: 'center' });
        doc.text('support@virtualservicesaf.com', 105, footerY + 15, { align: 'center' });
        doc.text('This is an automatically generated receipt', 105, footerY + 25, { align: 'center' });

        return doc.output('arraybuffer');
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF receipt: ' + error.message);
    }
};

const generateReceiptHTML = (name, orderDetails) => {
    // Determine language based on country
    const lang = COUNTRY_LANGUAGES[orderDetails.country] || COUNTRY_LANGUAGES.default;
    const t = translations[lang];

    const formattedDate = new Date(orderDetails.paymentDate).toLocaleString(
        lang === 'fr' ? 'fr-FR' : 'en-US',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        }
    );
    
    const localAmount = `${orderDetails.amount} ${orderDetails.currency}`;
    // Use provided USD amount or calculate it
    const usdAmount = orderDetails.amountUSD 
        ? `$${orderDetails.amountUSD.toFixed(2)} USD`
        : `$${(orderDetails.amount / 650).toFixed(2)} USD`;

    return `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #f7fafc; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a365d 0%, #2a4365 100%); color: white; padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700;">${t.receipt}</h1>
                <p style="margin: 10px 0 0; opacity: 0.9;">${formattedDate}</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 30px;">
                <!-- Customer Information -->
                <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h2 style="margin: 0 0 20px; color: #2d3748; font-size: 20px;">
                        ${t.customerInfo}
                    </h2>
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.fullName}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${name}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.phone}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${orderDetails.phone}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.country}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${orderDetails.country}</td>
                        </tr>
                    </table>
                </div>

                <!-- Transaction Details -->
                <div style="background: white; border-radius: 12px; padding: 24px;">
                    <h2 style="margin: 0 0 20px; color: #2d3748; font-size: 20px;">
                        ${t.transactionDetails}
                    </h2>
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.cardType}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${orderDetails.cardType}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.amountLocal}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${localAmount}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.amountUSD}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${usdAmount}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.paymentMethod}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${orderDetails.paymentMethod}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.reference}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">${orderDetails.reference}</td>
                        </tr>
                        <tr>
                            <td style="color: #4a5568; padding: 8px 0;">${t.transactionId}:</td>
                            <td style="color: #2d3748; font-weight: 600; text-align: right; padding: 8px 0;">
                                ${getTransactionIdDisplay(orderDetails.transactionId)}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #1a365d 0%, #2a4365 100%); color: white; padding: 24px; text-align: center; margin-top: 30px;">
                <p style="margin: 0 0 10px;">${t.thankYou}</p>
                <p style="margin: 0 0 20px;">${t.cardDetails}</p>
                <div style="font-size: 12px; opacity: 0.9;">
                    <p style="margin: 5px 0;">${t.autoGenerated}</p>
                </div>
            </div>
        </div>
    `;
};

router.post('/email/send-receipt', async (req, res) => {
    console.log('Received receipt request:', {
        email: req.body.email,
        name: req.body.name,
        orderDetails: req.body.orderDetails
    });

    const { email, name, orderDetails } = req.body;

    try {
        // Generate PDF receipt
        const pdfBuffer = await generatePDFReceipt(name, orderDetails);

        const mailOptions = {
            from: {
                name: 'Virtual Services',
                address: process.env.SMTP_FROM
            },
            to: email,
            subject: 'Payment Receipt - Virtual Card Purchase',
            html: generateReceiptHTML(name, orderDetails),
            attachments: [{
                filename: `receipt-${orderDetails.reference}.pdf`,
                content: Buffer.from(pdfBuffer),
                contentType: 'application/pdf'
            }]
        };

        console.log('Attempting to send email with options:', mailOptions);

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        
        res.status(200).json({ 
            success: true,
            message: 'Receipt sent successfully',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Failed to send receipt:', error);
        res.status(200).json({ 
            success: false,
            message: 'Payment successful, but receipt email failed',
            error: error.message 
        });
    }
});

router.post('/admin/send-topup-confirmation', async (req, res) => {
    try {
        // ... existing code ...
    } catch (error) {
        // Only log unexpected errors
        if (!error.message.includes('ETIMEDOUT')) {
            console.error('Email error:', error.message);
        }
        res.status(500).json({ error: 'Failed to send email' });
    }
});

router.post('/email/resend-receipt', async (req, res) => {
    console.log('Received resend receipt request:', {
        email: req.body.email,
        name: req.body.name,
        orderDetails: req.body.orderDetails
    });

    const { email, name, orderDetails } = req.body;

    try {
        // Add validation
        if (!email || !name || !orderDetails) {
            throw new Error('Missing required fields');
        }

        // Generate PDF receipt
        const pdfBuffer = await generatePDFReceipt(name, orderDetails);

        const mailOptions = {
            from: {
                name: 'Virtual Services',
                address: process.env.SMTP_FROM
            },
            to: email,
            subject: 'Payment Receipt - Virtual Card Purchase (Resent)',
            html: generateReceiptHTML(name, orderDetails),
            attachments: [{
                filename: `receipt-${orderDetails.reference}.pdf`,
                content: Buffer.from(pdfBuffer),
                contentType: 'application/pdf'
            }]
        };

        console.log('Attempting to resend email with options:', mailOptions);

        const info = await transporter.sendMail(mailOptions);
        console.log('Receipt email resent successfully:', info.messageId);
        
        res.status(200).json({ 
            success: true,
            message: 'Receipt resent successfully',
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Failed to resend receipt:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to resend receipt',
            error: error.message || 'Internal server error'
        });
    }
});

module.exports = router; 