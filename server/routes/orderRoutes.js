const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
require('dotenv').config();
const { sendReceiptEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
    try {
        const { cardType, amount, currency, paymentMethod, name, email, phone, country } = req.body;

        // Validate country support
        if (['BF', 'CI'].includes(country) && !['mobilemoney', 'wave'].includes(paymentMethod)) {
            return res.status(400).json({
                message: 'Only mobile money payments are supported in this country'
            });
        }

        // Create order record
        const order = new Order({
            cardType,
            amount,
            currency,
            paymentMethod,
            country,
            user: {
                name,
                email,
                phone
            },
            status: 'PENDING'
        });

        await order.save();

        if (paymentMethod === 'FLUTTERWAVE') {
            const tx_ref = `VCard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            order.flw_ref = tx_ref;
            order.reference = tx_ref;

            // Add specific configuration for XOF countries
            if (['SN', 'BF', 'CI'].includes(country)) {
                order.payment_details = {
                    currency: 'XOF',
                    network: 'wave'
                };
            }

            await order.save();

            return res.json({
                tx_ref,
                public_key: process.env.FLUTTERWAVE_PUBLIC_KEY,
                order_id: order._id,
                status: 'success'
            });
        } else if (paymentMethod === 'CAMPAY') {
            // Existing CAMPAY logic
            // ...
        }

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            message: 'Failed to create order',
            details: error.message 
        });
    }
});

// Update verification endpoint to handle both XAF and XOF
router.post('/verify-payment', async (req, res) => {
    try {
        const { transactionId, paymentMethod } = req.body;

        if (paymentMethod === 'FLUTTERWAVE') {
            const response = await axios.get(
                `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
                    }
                }
            );

            if (response.data.status === 'success') {
                const order = await Order.findOne({ flw_ref: response.data.data.tx_ref });
                if (order) {
                    console.log('Processing successful payment for order:', {
                        orderId: order._id,
                        customerEmail: order.user.email,
                        amount: order.amount,
                        currency: order.currency
                    });
                    
                    // Update order with payment details
                    order.status = 'SUCCESSFUL';
                    order.payment_details = {
                        ...order.payment_details,
                        ...response.data.data,
                        transaction_id: transactionId
                    };
                    
                    try {
                        await order.save();
                        console.log('Order updated successfully');

                        // Send receipt email
                        console.log('Initiating email send process...');
                        const emailSent = await sendReceiptEmail(order);
                        
                        if (emailSent) {
                            console.log('Receipt email sent successfully to:', order.user.email);
                        } else {
                            console.error('Failed to send receipt email to:', order.user.email);
                        }
                    } catch (error) {
                        console.error('Error in order update or email process:', {
                            error: error.message,
                            stack: error.stack
                        });
                    }

                    return res.json({ status: 'success' });
                } else {
                    console.error('Order not found:', {
                        tx_ref: response.data.data.tx_ref,
                        transactionId
                    });
                }
            }
        }

        res.status(400).json({ status: 'failed' });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

module.exports = router; 