const crypto = require('crypto');

const webhookAuth = {
    campay: (req, res, next) => {
        try {
            // Add Campay webhook verification
            const signature = req.headers['x-campay-signature'];
            if (!signature) {
                throw new Error('No signature provided');
            }
            
            // Verify webhook signature
            const payload = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', process.env.CAMPAY_WEBHOOK_SECRET)
                .update(payload)
                .digest('hex');
            
            if (signature !== expectedSignature) {
                throw new Error('Invalid signature');
            }
            
            next();
        } catch (error) {
            console.error('Campay webhook verification failed:', error);
            res.status(401).json({ error: 'Unauthorized' });
        }
    },

    flutterwave: (req, res, next) => {
        try {
            const signature = req.headers['verif-hash'];
            if (!signature || signature !== process.env.FLW_WEBHOOK_SECRET) {
                throw new Error('Invalid signature');
            }
            next();
        } catch (error) {
            console.error('Flutterwave webhook verification failed:', error);
            res.status(401).json({ error: 'Unauthorized' });
        }
    }
};

module.exports = webhookAuth; 