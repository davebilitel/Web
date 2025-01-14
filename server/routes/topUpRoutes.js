const express = require('express');
const router = express.Router();
const TopUpOrder = require('../models/TopUpOrder');
const Card = require('../models/Card');
const axios = require('axios');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const TopUpPreferences = require('../models/TopUpPreferences');
const FormData = require('form-data');
const { sendTopUpNotification } = require('../utils/emailService');

// Initialize payment for card top-up
router.post('/top-up-orders', async (req, res) => {
    try {
        const { cardId, amount, currency, paymentMethod, name, email, phone, country } = req.body;

        // Verify card exists and is active
        const card = await Card.findOne({ cardId });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        if (card.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Card is not active' });
        }

        // Create top-up order with mapped field names
        const order = new TopUpOrder({
            cardId,
            cardNumber: `${card.firstSixDigits}******${card.lastFourDigits}`,
            amount,
            amountUSD: amount, // You might need to convert this based on currency
            currency,
            customerName: name,         // Map name to customerName
            customerEmail: email,       // Map email to customerEmail
            customerPhone: phone,       // Map phone to customerPhone
            country,
            paymentMethod
        });

        await order.save();

        // Handle different payment methods
        if (paymentMethod === 'CAMPAY') {
            try {
                // Validate and format phone number
                let phoneNumber = phone.replace(/\D/g, '');
                if (!phoneNumber.startsWith('237')) {
                    phoneNumber = '237' + phoneNumber;
                }

                if (phoneNumber.length !== 12) {
                    throw new Error('Invalid phone number format. Must be 12 digits including 237 prefix');
                }

                // First, get a new token if needed
                const tokenResponse = await axios.post('https://campay.net/api/token/', {
                    username: process.env.CAMPAY_USERNAME,
                    password: process.env.CAMPAY_PASSWORD
                });
                
                const token = tokenResponse.data.token;

                // Then make the payment request with the new token
                const campayResponse = await axios.post('https://campay.net/api/collect/', {
                    amount: amount.toString(),
                    currency: currency,
                    from: phoneNumber,
                    description: `Card Top Up - ${cardId}`,
                    external_reference: order._id.toString(),
                    redirect_url: `${process.env.BASE_URL}/top-up-success`,
                    return_url: `${process.env.BASE_URL}/top-up-success`
                }, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Update the order with Campay reference
                order.reference = campayResponse.data.reference;
                await order.save();

                res.json({
                    order_id: order._id,
                    ussd_code: campayResponse.data.ussd_code,
                    operator: campayResponse.data.operator,
                    reference: campayResponse.data.reference,
                    payment_url: campayResponse.data.payment_url,
                    redirect_url: `${process.env.BASE_URL}/top-up-success?reference=${campayResponse.data.reference}`
                });
            } catch (campayError) {
                console.error('Campay API Error:', campayError.response?.data || campayError);
                
                // Send a more specific error message
                const errorMessage = campayError.response?.data?.detail || 
                                   campayError.response?.data?.message ||
                                   'Failed to initialize Campay payment';
                
                throw new Error(errorMessage);
            }
        } else if (paymentMethod === 'FLUTTERWAVE') {
            // Save the order first
            await order.save();

            // Send back all necessary data
            res.json({
                order_id: order._id,
                public_key: process.env.FLW_PUBLIC_KEY,
                tx_ref: order._id.toString(),  // This will be used as the order ID in the callback
                amount: order.amount,
                currency: order.currency
            });
        }
    } catch (error) {
        console.error('Top-up order error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to create top-up order'
        });
    }
});

// Add this function to get Campay token
const getCampayToken = async () => {
    try {
        const formData = new FormData();
        formData.append('username', process.env.CAMPAY_USERNAME);
        formData.append('password', process.env.CAMPAY_PASSWORD);

        const response = await axios.post('https://www.campay.net/api/token/', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        return response.data.token;
    } catch (error) {
        console.error('Error getting Campay token:', error);
        throw new Error('Failed to get Campay authentication token');
    }
};

// Verify payment status
router.post('/verify-top-up-payment', async (req, res) => {
    try {
        const { reference, orderId, transactionId, paymentMethod } = req.body;
        console.log('Verification request:', { reference, orderId, transactionId, paymentMethod });

        let order;
        if (paymentMethod === 'FLUTTERWAVE') {
            order = await TopUpOrder.findById(orderId);
        } else {
            order = await TopUpOrder.findOne({ reference });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log('Found order:', order);

        if (order.status === 'SUCCESSFUL') {
            return res.json({ 
                status: 'success',
                message: 'Payment already verified',
                order: order
            });
        }

        if (paymentMethod === 'FLUTTERWAVE') {
            try {
                const txId = transactionId || order.payment_details?.transaction_id;
                console.log('Verifying Flutterwave transaction:', txId);

                if (!txId) {
                    return res.json({ 
                        status: 'pending',
                        message: 'Transaction ID not yet available',
                        order: order
                    });
                }

                const response = await flw.Transaction.verify({ id: txId });
                
                if (response.data.status === "successful") {
                    // Update card balance
                    const card = await Card.findOne({ cardId: order.cardId });
                    if (!card) {
                        throw new Error('Card not found');
                    }

                    card.balance += order.amountUSD;
                    await card.save();

                    // Update order status and payment details
                    order.status = 'SUCCESSFUL';
                    order.payment_details = {
                        transaction_id: txId,
                        flw_ref: response.data.flw_ref,
                        completedAt: new Date().toISOString()
                    };
                    await order.save();

                    // Only send email notification when status changes to SUCCESSFUL
                    await sendTopUpNotification(order);

                    return res.json({ 
                        status: 'success',
                        order: order,
                        verificationResponse: response.data
                    });
                }
                
                return res.json({ 
                    status: 'pending',
                    order: order,
                    verificationResponse: response.data
                });
            } catch (error) {
                console.error('Flutterwave verification error:', error);
                throw new Error('Failed to verify payment with Flutterwave');
            }
        } else {
            // Campay verification
            try {
                const campayToken = await getCampayToken();
                
                const response = await axios.get(
                    `https://www.campay.net/api/transaction/${reference}/`,
                    {
                        headers: { 
                            'Authorization': `Token ${campayToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // If payment is successful and status is changing from pending to successful
                if (response.data.status.toLowerCase() === 'successful' && order.status !== 'SUCCESSFUL') {
                    const card = await Card.findOne({ cardId: order.cardId });
                    if (!card) {
                        throw new Error('Card not found');
                    }

                    card.balance += order.amountUSD;
                    await card.save();

                    // Update order status
                    order.status = 'SUCCESSFUL';
                    await order.save();

                    // Only send email notification when status changes to SUCCESSFUL
                    await sendTopUpNotification(order);
                }

                return res.json({
                    status: response.data.status.toLowerCase(),
                    order: order,
                    verificationResponse: response.data
                });
            } catch (error) {
                console.error('Campay verification error:', error);
                return res.json({
                    status: 'pending',
                    order: order,
                    error: error.message
                });
            }
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            status: 'failed',
            error: error.message || 'Failed to verify payment'
        });
    }
});

// Add this new route to get recent transactions
router.get('/recent-transactions/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        
        const recentTransactions = await TopUpOrder.find({
            cardId,
            status: 'SUCCESSFUL'
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('amount currency paymentMethod createdAt payment_details');

        res.json(recentTransactions);
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.status(500).json({ error: 'Failed to fetch recent transactions' });
    }
});

// Get preferences for a card
router.get('/preferences/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        let preferences = await TopUpPreferences.findOne({ cardId });
        
        if (!preferences) {
            preferences = await TopUpPreferences.create({ cardId });
        }

        res.json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// Update preferences after successful transaction
router.post('/preferences/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        const { amount, paymentMethod, action } = req.body;

        let preferences = await TopUpPreferences.findOne({ cardId });
        if (!preferences) {
            preferences = new TopUpPreferences({ cardId });
        }

        if (action === 'addFavorite') {
            if (!preferences.favoriteAmounts.includes(amount)) {
                preferences.favoriteAmounts.push(amount);
            }
        } else if (action === 'removeFavorite') {
            preferences.favoriteAmounts = preferences.favoriteAmounts.filter(a => a !== amount);
        } else {
            // Update last used amount and payment method
            preferences.lastAmount = amount;
            preferences.lastPaymentMethod = paymentMethod;
        }

        await preferences.save();
        res.json(preferences);
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// Add this new route near your other admin routes
router.post('/admin/send-topup-confirmation', async (req, res) => {
    try {
        const { transactionId } = req.body;
        
        // Find the transaction
        const transaction = await TopUpOrder.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Send the confirmation email
        await sendTopUpNotification(transaction);

        // Mark the transaction as confirmed
        transaction.emailConfirmed = true;
        await transaction.save();

        res.json({ message: 'Confirmation email sent successfully' });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        res.status(500).json({ error: 'Failed to send confirmation email' });
    }
});

module.exports = router; 