const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
require('dotenv').config();

// Create email transporter with updated configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    debug: true,
    logger: true
});

// Add transporter verification
transporter.verify()
    .then(() => {
        console.log('SMTP connection successful. Email service is ready.');
        console.log('Email configuration:', {
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            user: process.env.EMAIL
        });
    })
    .catch((error) => {
        console.error('Initial SMTP verification failed:', {
            error: error.message,
            code: error.code,
            command: error.command
        });
    });

// Function to generate PDF card
async function generateCardPDF(cardDetails) {
    const doc = new jsPDF();

    // Draw card background
    doc.setFillColor(0, 102, 204);
    doc.roundedRect(15, 40, 180, 100, 10, 10, 'F');

    // Add cardholder details
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(cardDetails.customerName, 25, 60);

    // Card number
    doc.setFontSize(18);
    doc.text(cardDetails.cardNumber.replace(/(.{4})/g, '$1 '), 25, 80);

    // Expiry Date and CVV
    doc.setFontSize(12);
    doc.text(`Expiry: ${cardDetails.expiryDate}`, 25, 100);
    doc.text(`CVV: ${cardDetails.cvv}`, 150, 100);

    // Add card ID and balance
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Card ID: ${cardDetails.cardId}`, 15, 160);
    doc.text(`Initial Balance: $${cardDetails.balance}`, 15, 170);

    // Return Buffer instead of ArrayBuffer
    return Buffer.from(doc.output('arraybuffer'));
}

// Add this function after the generateCardPDF function
function generateEmailHTML(cardDetails) {
    return `
        <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; color: #333; font-size: 24px; margin-bottom: 30px;">
                Card ID: ${cardDetails.cardId}
            </h2>
            
            <!-- Virtual Card Design -->
            <div style="
                background: linear-gradient(135deg, #0061f2 0%, #003a93 100%);
                border-radius: 15px;
                padding: 25px;
                color: white;
                margin: 20px 0;
                position: relative;
                min-height: 160px;
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            ">
                <!-- Customer Name -->
                <div style="
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    text-transform: uppercase;
                ">
                    ${cardDetails.customerName}
                </div>

                <!-- Card Number -->
                <div style="
                    font-family: 'Courier New', monospace;
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 2px;
                    text-align: center;
                    margin: 20px 0;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                ">
                    ${cardDetails.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                </div>

                <!-- Card Details Row -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    font-family: 'Courier New', monospace;
                ">
                    <!-- Expiry Date -->
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        padding: 8px 15px;
                        border-radius: 6px;
                    ">
                        <div style="
                            text-transform: uppercase;
                            font-size: 10px;
                            margin-bottom: 4px;
                            opacity: 0.8;
                        ">
                            Expires
                        </div>
                        <div style="font-size: 16px; letter-spacing: 1px;">
                            ${cardDetails.expiryDate}
                        </div>
                    </div>

                    <!-- CVV -->
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        padding: 8px 15px;
                        border-radius: 6px;
                    ">
                        <div style="
                            text-transform: uppercase;
                            font-size: 10px;
                            margin-bottom: 4px;
                            opacity: 0.8;
                        ">
                            CVV
                        </div>
                        <div style="font-size: 16px; letter-spacing: 1px;">
                            ${cardDetails.cvv}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Balance Display -->
            <div style="
                background: #f8f9fa;
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            ">
                <div style="font-size: 16px; color: #666;">Available Balance</div>
                <div style="font-size: 24px; color: #28a745; font-weight: bold;">$${cardDetails.balance}</div>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://bilitech.io/ivcc/recharge" style="
                    display: inline-block;
                    padding: 12px 25px;
                    margin: 5px;
                    color: white;
                    background-color: #28a745;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                ">Top Up</a>
                <a href="https://oragpay.com/guide" style="
                    display: inline-block;
                    padding: 12px 25px;
                    margin: 5px;
                    color: white;
                    background-color: #007BFF;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                ">More Info</a>
            </div>

            <!-- Security Notice -->
            <div style="
                margin-top: 30px;
                padding: 15px;
                background: #fff3cd;
                border: 1px solid #ffeeba;
                border-radius: 5px;
                color: #856404;
                font-size: 14px;
                text-align: center;
            ">
                Please keep your card information secure and do not share it with others.
            </div>

            <!-- Footer -->
            <div style="
                margin-top: 30px;
                text-align: center;
                color: #6c757d;
                font-size: 12px;
            ">
                © ${new Date().getFullYear()} Virtual Services. All rights reserved.
            </div>
        </div>
    `;
}

// Create a new card
router.post('/cards', auth, async (req, res) => {
    try {
        const { type, balance } = req.body;
        
        const card = new Card({
            type,
            balance,
            status: 'ACTIVE'
        });

        await card.save();
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all cards with optional filters
router.get('/cards', auth, async (req, res) => {
    try {
        const { type, status } = req.query;
        const query = {};
        
        if (type) query.type = type;
        if (status) query.status = status;

        const cards = await Card.find(query).sort({ createdAt: -1 });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update card balance
router.patch('/cards/:id/balance', auth, async (req, res) => {
    try {
        const { amount, operation } = req.body;
        const card = await Card.findById(req.params.id);
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        if (operation === 'add') {
            card.balance += amount;
        } else if (operation === 'subtract') {
            if (card.balance < amount) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }
            card.balance -= amount;
        }

        await card.save();
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update card status
router.patch('/cards/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate a random 6-character card ID
function generateCardId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Send card to customer
router.post('/send-card', auth, async (req, res) => {
    try {
        // Add request logging
        console.log('Received send-card request:', req.body);
        
        const {
            type,
            cardNumber,
            cvv,
            expiryDate,
            customerName,
            customerEmail,
            balance
        } = req.body;

        // Create a new card record with a unique card ID
        const cardId = generateCardId();
        const card = new Card({
            cardId,
            type,
            cardNumber,
            firstSixDigits: cardNumber.slice(0, 6),
            lastFourDigits: cardNumber.slice(-4),
            cvv,
            expiryDate,
            customerName,
            customerEmail,
            balance,
            status: 'ACTIVE'
        });

        await card.save();
        console.log('Card saved successfully:', cardId);

        // Generate PDF
        const pdfBuffer = await generateCardPDF({
            cardId,
            customerName,
            cardNumber,
            cvv,
            expiryDate,
            balance
        });

        // Create HTML email content
        const emailHTML = generateEmailHTML({
            cardId,
            customerName,
            cardNumber,
            cvv,
            expiryDate,
            balance
        });

        // Send email with attachment
        const mailOptions = {
            from: {
                name: 'Virtual Services',
                address: process.env.EMAIL
            },
            to: customerEmail,
            subject: 'Your Virtual Card Details',
            html: emailHTML,
            attachments: [
                {
                    filename: 'card-details.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        try {
            console.log('Attempting to send email with config:', {
                from: process.env.EMAIL,
                to: customerEmail,
                subject: 'Your Virtual Card Details'
            });

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info);
            res.status(201).json({ message: 'Card sent successfully' });
        } catch (emailError) {
            console.error('Detailed email error:', {
                error: emailError.message,
                code: emailError.code,
                command: emailError.command,
                response: emailError.response,
                responseCode: emailError.responseCode
            });
            res.status(201).json({ 
                message: 'Card created but email sending failed',
                warning: 'Email delivery failed',
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('Error in send-card:', error);
        res.status(500).json({ error: error.message || 'Failed to create card' });
    }
});

// Get all sent cards
router.get('/sent-cards', auth, async (req, res) => {
    try {
        const cards = await Card.find()
            .select('cardId type firstSixDigits lastFourDigits customerName customerEmail status createdAt')
            .sort('-createdAt');
        
        // Add error logging
        console.log('Found cards:', cards.length);
        
        res.json(cards);
    } catch (error) {
        console.error('Error fetching sent cards:', error);
        res.status(500).json({ error: 'Failed to fetch sent cards' });
    }
});

// Add this new route after the send-card route
router.post('/resend-card', auth, async (req, res) => {
    try {
        const { cardId } = req.body;
        const card = await Card.findOne({ cardId });
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Generate PDF
        const pdfBuffer = await generateCardPDF({
            cardId: card.cardId,
            customerName: card.customerName,
            cardNumber: card.cardNumber,
            cvv: card.cvv,
            expiryDate: card.expiryDate,
            balance: card.balance
        });

        // Reuse the same email template and sending logic
        const mailOptions = {
            from: {
                name: 'Virtual Services',
                address: process.env.EMAIL
            },
            to: card.customerEmail,
            subject: 'Your Virtual Card Details (Resent)',
            html: generateEmailHTML({
                cardId: card.cardId,
                customerName: card.customerName,
                cardNumber: card.cardNumber,
                cvv: card.cvv,
                expiryDate: card.expiryDate,
                balance: card.balance
            }),
            attachments: [
                {
                    filename: 'card-details.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Card details resent successfully' });
    } catch (error) {
        console.error('Error in resend-card:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add delete route
router.delete('/cards/:cardId', auth, async (req, res) => {
    try {
        const card = await Card.findOneAndDelete({ cardId: req.params.cardId });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

module.exports = router; 