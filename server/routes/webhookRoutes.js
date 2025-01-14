const express = require('express');
const router = express.Router();
const webhookAuth = require('../middleware/webhookAuth');
const TopUpOrder = require('../models/TopUpOrder');
const CardOrder = require('../models/CardOrder');

// Campay webhook handler
router.post('/campay', webhookAuth.campay, async (req, res) => {
    try {
        const { reference, status, external_reference } = req.body;
        console.log('Campay webhook received:', req.body);

        // Find order in both collections
        let order = await TopUpOrder.findOne({ 
            $or: [
                { reference },
                { external_reference }
            ]
        });

        if (!order) {
            order = await CardOrder.findOne({
                $or: [
                    { reference },
                    { external_reference }
                ]
            });
        }

        if (!order) {
            console.error('Order not found:', reference);
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status
        order.status = status.toUpperCase();
        order.payment_details = {
            ...order.payment_details,
            webhook_received: new Date(),
            webhook_data: req.body
        };

        await order.save();
        console.log(`Order ${order._id} updated to ${status}`);

        res.json({ success: true });
    } catch (error) {
        console.error('Campay webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Flutterwave webhook handler
router.post('/flutterwave', webhookAuth.flutterwave, async (req, res) => {
    try {
        const { txRef, status, transactionId } = req.body.data;
        console.log('Flutterwave webhook received:', req.body);

        let order = await TopUpOrder.findOne({ tx_ref: txRef });
        if (!order) {
            order = await CardOrder.findOne({ tx_ref: txRef });
        }

        if (!order) {
            console.error('Order not found:', txRef);
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status
        order.status = status === 'successful' ? 'SUCCESSFUL' : 'FAILED';
        order.payment_details = {
            ...order.payment_details,
            webhook_received: new Date(),
            webhook_data: req.body,
            transaction_id: transactionId
        };

        await order.save();
        console.log(`Order ${order._id} updated to ${status}`);

        res.json({ success: true });
    } catch (error) {
        console.error('Flutterwave webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 