const express = require('express');
const router = express.Router();
const CardOrder = require('../models/CardOrder');
const axios = require('axios');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const FormData = require('form-data');
const { sendCardOrderNotification } = require('../utils/emailService');
const mongoose = require('mongoose');

// Verify environment variables
const requiredEnvVars = [
    'CAMPAY_USERNAME',
    'CAMPAY_PASSWORD',
    'BASE_URL'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

console.log('Environment check passed. Required variables present.');

// Get Campay token helper function
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

// Initialize payment for card purchase
router.post('/card-orders', async (req, res) => {
    try {
        console.log('Initiating card purchase payment:', req.body);
        const { cardType, amount, currency, paymentMethod, name, email, phone, country } = req.body;

        // Create card order
        const order = new CardOrder({
            cardType,
            amount,
            amountUSD: amount,
            currency,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            country,
            paymentMethod
        });

        await order.save();
        console.log('Card order created:', order._id);

        // Handle Campay payment
        if (paymentMethod === 'CAMPAY') {
            try {
                console.log('Initiating Campay payment...');
                let phoneNumber = phone.replace(/\D/g, '');
                if (!phoneNumber.startsWith('237')) {
                    phoneNumber = '237' + phoneNumber;
                }

                if (phoneNumber.length !== 12) {
                    throw new Error('Invalid phone number format. Must be 12 digits including 237 prefix');
                }

                // Get Campay token
                console.log('Getting Campay token...');
                const formData = new FormData();
                formData.append('username', process.env.CAMPAY_USERNAME);
                formData.append('password', process.env.CAMPAY_PASSWORD);

                const tokenResponse = await axios.post('https://www.campay.net/api/token/', formData, {
                    headers: {
                        ...formData.getHeaders()
                    }
                });
                
                const token = tokenResponse.data.token;
                console.log('Campay token received:', token);

                // Make payment request
                console.log('Making Campay payment request with data:', {
                    amount: amount.toString(),
                    currency,
                    from: phoneNumber,
                    description: `${cardType} Card Purchase`,
                    external_reference: order._id.toString()
                });

                const campayResponse = await axios.post('https://www.campay.net/api/collect/', {
                    amount: amount.toString(),
                    currency: currency,
                    from: phoneNumber,
                    description: `${cardType} Card Purchase`,
                    external_reference: order._id.toString(),
                    redirect_url: `${process.env.BASE_URL}/payment-success`,
                    return_url: `${process.env.BASE_URL}/payment-success`,
                    webhook_url: `${process.env.BASE_URL}/webhook/campay`
                }, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Campay payment response:', campayResponse.data);

                // Update order with reference
                order.reference = campayResponse.data.reference;
                await order.save();

                res.json({
                    order_id: order._id,
                    ussd_code: campayResponse.data.ussd_code,
                    operator: campayResponse.data.operator,
                    reference: campayResponse.data.reference,
                    payment_url: campayResponse.data.payment_url
                });
            } catch (error) {
                console.error('Campay API Error:', {
                    message: error.message,
                    response: error.response?.data,
                    stack: error.stack,
                    config: error.config
                });
                
                const errorMessage = error.response?.data?.detail || 
                                   error.response?.data?.message ||
                                   error.message ||
                                   'Failed to initialize Campay payment';
                
                res.status(400).json({
                    error: errorMessage,
                    details: error.response?.data
                });
            }
        } 
        // Handle Flutterwave payment
        else if (paymentMethod === 'FLUTTERWAVE') {
            res.json({
                order_id: order._id,
                public_key: process.env.FLW_PUBLIC_KEY,
                tx_ref: order._id.toString(),
                amount: order.amount,
                currency: order.currency
            });
        }
    } catch (error) {
        console.error('Card order error:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({ 
            error: error.message || 'Failed to create card order',
            details: error.response?.data
        });
    }
});

// Verify payment status
router.post('/verify-payment', async (req, res) => {
    try {
        const { reference, orderId, transactionId, paymentMethod } = req.body;
        console.log('Card Order - Verifying payment:', { reference, orderId, transactionId, paymentMethod });

        let order;
        if (paymentMethod === 'FLUTTERWAVE') {
            try {
                // First try to find by ObjectId
                if (mongoose.Types.ObjectId.isValid(orderId)) {
                    order = await CardOrder.findById(orderId);
                    console.log('Found order by ID:', order);
                }
                
                // If not found, try by tx_ref
                if (!order) {
                    order = await CardOrder.findOne({ tx_ref: orderId });
                    console.log('Found order by tx_ref:', order);
                }
            } catch (err) {
                console.error('Error finding order:', err);
            }
        } else {
            order = await CardOrder.findOne({ reference });
            console.log('Found order by reference:', order);
        }

        if (!order) {
            console.error('Order not found:', { orderId, reference });
            return res.status(404).json({ 
                status: 'failed',
                error: 'Order not found' 
            });
        }

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

                const response = await flw.Transaction.verify({ id: txId });
                console.log('Flutterwave verification response:', response);
                
                if (response.data.status === "successful") {
                    // Update order with complete transaction details
                    order.status = 'SUCCESSFUL';
                    order.tx_ref = response.data.tx_ref;
                    order.flw_ref = response.data.flw_ref;
                    order.transaction_id = response.data.id;
                    order.payment_details = {
                        transaction_id: txId,
                        flw_ref: response.data.flw_ref,
                        amount: response.data.amount,
                        currency: response.data.currency,
                        payment_type: response.data.payment_type,
                        narration: response.data.narration,
                        processor_response: response.data.processor_response,
                        charged_amount: response.data.charged_amount,
                        app_fee: response.data.app_fee,
                        merchant_fee: response.data.merchant_fee,
                        payment_date: response.data.created_at,
                        customer: {
                            name: response.data.customer.name,
                            email: response.data.customer.email,
                            phone: response.data.customer.phone_number
                        },
                        meta: response.data.meta,
                        completedAt: new Date().toISOString()
                    };

                    await order.save();
                    console.log('Order updated successfully:', order);

                    // Try to send notification but don't fail if it errors
                    try {
                        await sendCardOrderNotification(order);
                    } catch (notificationError) {
                        console.error('Notification failed but payment was successful:', notificationError);
                    }

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
                return res.json({ 
                    status: 'failed',
                    error: error.message || 'Failed to verify payment with Flutterwave'
                });
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

                console.log('Campay verification response:', response.data);

                // If payment is successful and status is changing from pending to successful
                if (response.data.status.toLowerCase() === 'successful' && order.status !== 'SUCCESSFUL') {
                    // Update order status
                    order.status = 'SUCCESSFUL';
                    order.payment_details = {
                        transaction_id: reference,
                        payment_type: 'MOBILE_MONEY',
                        amount: order.amount,
                        currency: order.currency,
                        payment_date: new Date().toISOString(),
                        customer: {
                            name: order.customerName,
                            email: order.customerEmail,
                            phone: order.customerPhone
                        },
                        meta: response.data
                    };
                    await order.save();

                    // Try to send notification but don't fail if it errors
                    try {
                        await sendCardOrderNotification(order);
                    } catch (notificationError) {
                        console.error('Notification failed but payment was successful:', notificationError);
                    }

                    return res.json({
                        status: 'success',
                        order: order,
                        verificationResponse: response.data
                    });
                }

                // If payment is still pending
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

// Add this new route to test Campay credentials
router.get('/test-campay', async (req, res) => {
    try {
        const formData = new FormData();
        formData.append('username', process.env.CAMPAY_USERNAME);
        formData.append('password', process.env.CAMPAY_PASSWORD);

        const response = await axios.post('https://www.campay.net/api/token/', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        res.json({
            status: 'success',
            message: 'Campay credentials are valid',
            token: response.data.token
        });
    } catch (error) {
        console.error('Campay test failed:', {
            message: error.message,
            response: error.response?.data
        });
        
        res.status(500).json({
            status: 'error',
            message: 'Campay credentials test failed',
            error: error.response?.data || error.message
        });
    }
});

module.exports = router; 