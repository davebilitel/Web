const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const Message = require('../models/Message');

// Temporarily disable validation for testing
const twilioWebhookMiddleware = twilio.webhook({
    validate: false
});

// Handle incoming SMS webhook
router.post('/webhook', twilioWebhookMiddleware, async (req, res) => {
    console.log('\n=== Incoming SMS Webhook ===');
    console.log('Time:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    try {
        const message = new Message({
            from: req.body.From || 'unknown',
            body: req.body.Body || 'No message body',
            timestamp: new Date(),
            messageId: req.body.MessageSid || `manual-${Date.now()}`,
            status: req.body.SmsStatus || 'received'
        });

        // Save to database
        await message.save();
        console.log('Message saved to database:', message);

        // Emit to websocket clients
        const io = req.app.get('io');
        if (io) {
            io.emit('newMessage', message);
            console.log('Emitted new message to websocket clients');
        }

        // Send TwiML response
        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Message>Message received</Message>
            </Response>`;
            
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml);

    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Error processing webhook');
    }
});

// Get all messages
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 });
        console.log('Retrieved messages:', messages);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Add a test message endpoint
router.post('/test-message', async (req, res) => {
    try {
        const testMessage = new Message({
            from: '+1234567890',
            body: 'Test message from API',
            timestamp: new Date(),
            messageId: `test-${Date.now()}`,
            status: 'received'
        });

        await testMessage.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('newMessage', testMessage);
        }

        res.json({ success: true, message: testMessage });
    } catch (error) {
        console.error('Error creating test message:', error);
        res.status(500).json({ error: 'Failed to create test message' });
    }
});

module.exports = router; 