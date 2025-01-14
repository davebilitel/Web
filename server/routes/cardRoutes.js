const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const Order = require('../models/Order');
const axios = require('axios');
const logger = require('../utils/logger');
const BalanceRequest = require('../models/BalanceRequest');

// Get all cards
router.get('/cards', async (req, res) => {
    try {
        const query = { status: 'AVAILABLE' };
        if (req.query.type && req.query.type !== 'ALL') {
            query.type = req.query.type;
        }
        const cards = await Card.find(query);
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// Get single card
router.get('/cards/:id', async (req, res) => {
    try {
        const cardId = encodeURIComponent(req.params.id);
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch card' });
    }
});

// Get Campay token
const getNewCampayToken = async () => {
    try {
        const response = await axios.post('https://campay.net/api/token/', {
            username: process.env.CAMPAY_USERNAME,
            password: process.env.CAMPAY_PASSWORD
        });
        return response.data.token;
    } catch (error) {
        logger.error('Failed to get Campay token', error);
        throw error;
    }
};

// Create order and initialize payment
router.post('/orders', async (req, res) => {
    try {
        const { cardType, amount, name, email, phone, paymentMethod } = req.body;
        
        logger.debug('New order request', { cardType, amount, email, paymentMethod });

        // Format phone number
        let phoneNumber = phone.replace(/\D/g, '');
        if (!phoneNumber.startsWith('237')) {
            phoneNumber = '237' + phoneNumber;
        }

        // Create order
        const order = new Order({
            user: { name, email, phone: phoneNumber },
            cardType,
            amount,
            paymentMethod,
            tx_ref: `${paymentMethod.toLowerCase()}-${Date.now()}`
        });
        await order.save();
        logger.info('Order created', { orderId: order._id });

        if (paymentMethod === 'CAMPAY') {
            const token = await getNewCampayToken();
            const redirectUrl = process.env.BASE_URL || 'http://localhost:3000';
            
            const paymentResponse = await axios.post('https://campay.net/api/collect/', {
                amount: amount.toString(),
                currency: "XAF",
                from: phoneNumber,
                description: "Virtual Card Purchase",
                external_reference: order.tx_ref,
                redirect_url: `${redirectUrl}/success`,
                failure_url: `${redirectUrl}/failed`
            }, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            logger.debug('Campay payment initialized', { 
                reference: paymentResponse.data.reference 
            });
            
            order.reference = paymentResponse.data.reference;
            await order.save();

            res.json({
                reference: paymentResponse.data.reference,
                ussd_code: paymentResponse.data.ussd_code,
                operator: paymentResponse.data.operator,
                status: 'PENDING'
            });

        } else if (paymentMethod === 'FLUTTERWAVE') {
            logger.debug('Flutterwave payment initialized', { tx_ref: order.tx_ref });
            res.json({
                tx_ref: order.tx_ref,
                public_key: process.env.FLW_PUBLIC_KEY
            });
        }

    } catch (error) {
        logger.error('Payment initialization failed', error);
        res.status(500).json({ 
            error: 'Failed to create order',
            details: isDev ? error.message : 'Internal server error'
        });
    }
});

// Add this new route to check payment status
router.get('/payment-status/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        console.log('=== Checking Payment Status ===');
        console.log('Reference:', reference);
        
        const token = await getNewCampayToken();
        console.log('Got token for status check');
        
        const statusResponse = await axios.get(`https://campay.net/api/transaction/${reference}/`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Campay Status Response:', statusResponse.data);

        // Get the status from Campay response
        const campayData = statusResponse.data;
        const campayStatus = campayData.status.toUpperCase();
        
        // Map Campay status to our status
        let orderStatus;
        if (campayStatus === 'SUCCESSFUL') {
            orderStatus = 'SUCCESSFUL';
        } else if (campayStatus === 'FAILED') {
            orderStatus = 'FAILED';
        } else {
            orderStatus = 'PENDING';
        }

        // Update order status in database
        const order = await Order.findOne({ reference });
        if (order) {
            console.log(`Updating order status from ${order.status} to ${orderStatus}`);
            order.status = orderStatus;
            
            // Store complete transaction details
            order.payment_details = {
                amount: campayData.amount,
                currency: campayData.currency,
                payment_type: 'MOBILE_MONEY',
                operator: campayData.operator,
                operator_reference: campayData.operator_reference,
                code: campayData.code,
                phone_number: campayData.phone_number,
                description: campayData.description,
                external_reference: campayData.external_reference,
                payment_date: new Date(),
                customer: {
                    name: order.user.name,
                    email: order.user.email,
                    phone: order.user.phone
                }
            };

            await order.save();
            console.log('Order updated with payment details:', {
                orderId: order._id,
                status: order.status,
                operator_reference: campayData.operator_reference
            });
        }

        res.json({
            status: orderStatus,
            reference: reference,
            campayStatus: statusResponse.data.status,
            operator_reference: statusResponse.data.operator_reference
        });
    } catch (error) {
        console.error('Payment status check error:', error.response?.data || error);
        res.status(500).json({ 
            error: 'Failed to check payment status',
            details: error.response?.data || error.message
        });
    }
});

// Update the webhook handler for Campay
router.post('/webhook/campay', async (req, res) => {
    try {
        console.log('=== Campay Webhook Received ===');
        console.log('Webhook Data:', req.body);

        const { reference, status, operator_reference } = req.body;

        const order = await Order.findOne({ reference });
        if (!order) {
            console.log('Order not found for reference:', reference);
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status.toUpperCase();
        if (operator_reference) {
            order.payment_details = {
                ...order.payment_details,
                operator_reference,
                payment_date: new Date()
            };
        }

        await order.save();
        console.log(`Order ${order._id} updated with status ${status} and reference ${operator_reference}`);

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Create a rate limiter store
const balanceRequests = new Map();

// Update the rate limit middleware to be simpler
const checkBalanceRateLimit = async (req, res, next) => {
    const { cardId } = req.body;
    
    if (!cardId) {
        return res.status(400).json({ error: 'Card ID is required' });
    }

    const lastRequest = balanceRequests.get(cardId);
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

    if (lastRequest) {
        const timeSinceLastRequest = now - lastRequest;
        if (timeSinceLastRequest < tenMinutes) {
            const minutesLeft = Math.ceil((tenMinutes - timeSinceLastRequest) / 60000);
            return res.status(429).json({ 
                error: `Please wait ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} before checking balance again`
            });
        }
    }

    // Update the timestamp for this cardId
    balanceRequests.set(cardId, now);

    // Clean up old entries every hour
    if (balanceRequests.size > 1000) { // Prevent memory leaks
        const oneHourAgo = now - (60 * 60 * 1000);
        for (const [key, timestamp] of balanceRequests) {
            if (timestamp < oneHourAgo) {
                balanceRequests.delete(key);
            }
        }
    }

    next();
};

// Update the check-balance route to use rate limiting
router.post('/check-balance', checkBalanceRateLimit, async (req, res) => {
    try {
        const { cardId } = req.body;
        
        // First find the card to get its details
        const card = await Card.findOne({ cardId });
        
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // Create new balance request with card details
        const balanceRequest = new BalanceRequest({
            cardId: card.cardId,
            cardNumber: `${card.firstSixDigits}******${card.lastFourDigits}`,
            customerEmail: card.customerEmail,
            status: 'PENDING',
            requestedAt: new Date()
        });
        
        await balanceRequest.save();
        
        return res.json({ 
            status: 'PENDING',
            message: 'Balance request submitted successfully'
        });
    } catch (error) {
        console.error('Error checking balance:', error);
        return res.status(500).json({ error: 'Failed to process balance check request' });
    }
});

// Add this new route to handle card verification
router.post('/verify-id', async (req, res) => {
    try {
        const { cardId } = req.body;
        const card = await Card.findOne({ cardId });

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.json({
            cardNumber: `${card.firstSixDigits}******${card.lastFourDigits}`,
            type: card.type,
            email: card.customerEmail,
            status: card.status,
            name: card.customerName
        });
    } catch (error) {
        console.error('Card verification error:', error);
        res.status(500).json({ error: 'Failed to verify card' });
    }
});

// Add cache headers for static assets
router.get('/static/*', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
});

// Add offline support for API routes
router.get('/api/*', async (req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-cache');
    next();
});

module.exports = router; 