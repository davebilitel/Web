require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { exec } = require('child_process');
const Flutterwave = require('flutterwave-node-v3');
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const ngrok = require('ngrok');
const cardRoutes = require('./routes/cardRoutes');
const Order = require('./models/Order');
const cardManagementRoutes = require('./routes/cardManagementRoutes');
const topUpRoutes = require('./routes/topUpRoutes');
const cardOrderRoutes = require('./routes/cardOrderRoutes');
const TopUpOrder = require('./models/TopUpOrder');
const CardOrder = require('./models/CardOrder');
const emailRoutes = require('./routes/emailRoutes');
const generateSitemap = require('./utils/sitemapGenerator');
const path = require('path');
const nodemailer = require('nodemailer');
const http = require('http');
const socketIo = require('socket.io');
const smsRoutes = require('./routes/smsRoutes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://poweredbybilitech.com', 'https://www.poweredbybilitech.com']
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 
                "https://api.poweredbybilitech.com",
                "https://poweredbybilitech.com",
                "https://campay.net",
                "https://api.flutterwave.com"
            ]
        }
    },
    crossOriginEmbedderPolicy: false
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsInsecure: true,
    retryWrites: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('Successfully connected to MongoDB Atlas');
})
.catch(err => {
    console.error('MongoDB Atlas connection error:', err.message);
});

// Add connection event handlers
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
});

// Add admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Add webhook routes
app.use('/webhook', webhookRoutes);

// Use routes
app.use('/api', cardRoutes);

// Make sure routes are added before starting the server
app.use('/api/sms', smsRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://poweredbybilitech.com', 'https://www.poweredbybilitech.com']
            : 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket connection handling
io.on('connection', (socket) => {
    console.log('Client connected to WebSocket');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected from WebSocket');
    });
});

// Store io instance on app
app.set('io', io);

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Update token management
const getNewCampayToken = async () => {
    try {
        // Check if we have a valid token
        if (campayToken && tokenExpiry && new Date() < tokenExpiry) {
            return campayToken;
        }

        console.log('Getting new Campay token...');
        const response = await axios.post('https://campay.net/api/token/', {
            username: process.env.CAMPAY_USERNAME,
            password: process.env.CAMPAY_PASSWORD
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.data || !response.data.token) {
            throw new Error('Failed to get valid token from Campay');
        }

        // Store token and set expiry (55 minutes)
        campayToken = response.data.token;
        tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
        console.log('New token received successfully');

        return campayToken;
    } catch (error) {
        console.error('Error getting Campay token:', error.response?.data || error.message);
        throw error;
    }
};

// Update the headers function
const getCampayHeaders = async () => {
    try {
        const token = await getNewCampayToken();
        return {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    } catch (error) {
        console.error('Error getting headers:', error);
        throw error;
    }
};

// Update the initiate-payment endpoint
app.post('/api/initiate-payment', async (req, res) => {
    try {
        console.log('Initiating Campay payment...', req.body);
        
        let phoneNumber = req.body.phone;
        phoneNumber = phoneNumber.replace(/\D/g, '');
        
        if (!phoneNumber.startsWith('237')) {
            phoneNumber = '237' + phoneNumber;
        }
        
        if (phoneNumber.length !== 12) {
            throw new Error('Invalid phone number format. Must be 237XXXXXXXXX');
        }

        // Create payment first
        const payment = new Payment({
            name: req.body.name,
            email: req.body.email,
            phone: phoneNumber,
            amount: req.body.amount,
            paymentMethod: 'campay',
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await payment.save();

        console.log('Getting token...');
        const headers = await getCampayHeaders();
        console.log('Token received successfully');

        // Add payment method to redirect URLs
        const successUrl = `${ngrokUrl}/success?payment_method=campay`;
        const failureUrl = `${ngrokUrl}/failed?payment_method=campay`;

        console.log('Redirect URLs:', {
            success: successUrl,
            failure: failureUrl,
            webhook: `${ngrokUrl}/webhook`
        });

        const paymentResponse = await axios.post('https://campay.net/api/collect/', {
            amount: req.body.amount,
            currency: "XAF",
            from: phoneNumber,
            description: `Payment from ${req.body.name}`,
            external_reference: payment._id.toString(),
            redirect_url: successUrl,
            failure_url: failureUrl,
            webhook_url: `${ngrokUrl}/webhook`
        }, { headers });

        // Update payment with Campay reference
        await Payment.findByIdAndUpdate(payment._id, {
            reference: paymentResponse.data.reference
        });

        res.json(paymentResponse.data);
    } catch (error) {
        console.error('Payment Error:', error.response?.data || error);
        res.status(500).json({ 
            error: 'Payment initiation failed',
            details: error.response?.data || error.message 
        });
    }
});

// Webhook handler
app.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        console.log('Webhook received:', data);

        if (data.reference) {
            // This is a Campay webhook
            const status = data.status === 'success' ? 'SUCCESSFUL' : 
                          data.status === 'failed' ? 'FAILED' : 'PENDING';

            const updatedPayment = await Payment.findOneAndUpdate(
                { reference: data.reference },
                { 
                    status,
                    updatedAt: new Date(),
                    paymentDetails: data
                },
                { new: true }
            );

            console.log('Campay payment updated:', {
                reference: data.reference,
                status,
                paymentId: updatedPayment?._id
            });
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Update the periodic check function to use direct token requests
const checkPendingPayments = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        const pendingPayments = await Payment.find({
            paymentMethod: 'campay',
            status: 'PENDING',
            createdAt: { $gte: thirtyMinutesAgo }
        });

        if (pendingPayments.length === 0) return;

        for (const payment of pendingPayments) {
            try {
                const headers = await getCampayHeaders();
                const response = await axios.get(
                    `https://campay.net/api/transaction/${payment.reference}/`,
                    { headers }
                );

                if (response.data.status) {
                    const status = response.data.status === 'success' ? 'SUCCESSFUL' : 
                                 response.data.status === 'failed' ? 'FAILED' : 'PENDING';
                    
                    if (status !== 'PENDING') {
                        await Payment.findByIdAndUpdate(
                            payment._id,
                            { 
                                status,
                                updatedAt: new Date(),
                                paymentDetails: response.data
                            }
                        );
                        console.log(`Updated payment ${payment.reference} status to ${status}`);
                    }
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.error(`Error checking payment ${payment.reference}:`, error.message);
                }
            }
            
            // Add delay between requßests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error in checkPendingPayments:', error.message);
    }
};

// Update the check interval to run less frequently
setInterval(async () => {
    if (checkingInProgress) return;
    checkingInProgress = true;
    try {
        await checkPendingPayments();
    } finally {
        checkingInProgress = false;
    }
}, 5 * 60 * 1000); // Check every 5 minutes instead of every minute

// Update the check-payment-status endpoint
app.get('/api/check-payment-status/:reference', async (req, res) => {
    try {
        const payment = await Payment.findOne({ 
            $or: [
                { reference: req.params.reference },
                { transaction_id: req.params.reference },
                { tx_ref: req.params.reference }
            ]
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({ status: payment.status });
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add success and failed routes
app.get('/success', (req, res) => {
    console.log('Success route hit with query:', req.query);
    const params = new URLSearchParams(req.query);
    
    // Handle Campay success
    if (req.query.transaction_id) {
        params.set('reference', req.query.transaction_id);
        params.set('payment_method', 'campay');
    }
    
    // Handle Flutterwave success 
    if (req.query.tx_ref) {
        params.set('reference', req.query.tx_ref);
        params.set('payment_method', 'flutterwave');
    }

    const redirectUrl = `${process.env.BASE_URL}/success?${params.toString()}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
});

app.get('/failed', (req, res) => {
    console.log('Failed route hit with query:', req.query);
    const tx_ref = req.query.tx_ref;
    
    if (!tx_ref) {
        return res.status(400).json({ error: 'No transaction reference provided' });
    }

    // Update payment status to FAILED
    Payment.findOneAndUpdate(
        { tx_ref: tx_ref },
        { 
            status: 'FAILED',
            updatedAt: new Date()
        },
        { new: true }
    ).then(() => {
        // Redirect to frontend failed page
        const redirectUrl = `${process.env.BASE_URL}/failed?tx_ref=${tx_ref}`;
        console.log('Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
    }).catch(error => {
        console.error('Error updating failed payment:', error);
        res.redirect(`${process.env.BASE_URL}/failed?tx_ref=${tx_ref}`);
    });
});

// Cleanup on server shutdown
process.on('SIGTERM', async () => {
    await ngrok.kill();
    process.exit(0);
});

// Add Flutterwave initialization
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

// Existing Campay payment endpoint
app.post('/api/initiate-campay-payment', async (req, res) => {
    try {
        // Validate required fields
        const { name, email, phone, amount } = req.body;
        if (!name || !email || !phone || !amount) {
            console.error('Missing required fields:', req.body);
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Name, email, phone, and amount are required'
            });
        }

        console.log('Initiating Campay payment with data:', {
            name, email, phone, amount
        });

        const token = await getNewCampayToken();
        console.log('Token received successfully');

        const baseUrl = ngrokUrl || process.env.BASE_URL;
        
        // Match Flutterwave's pattern exactly
        const tx_ref = `campay-${Date.now()}`;
        
        const redirectUrls = {
            success: `${baseUrl}/success?tx_ref=${tx_ref}`,
            failure: `${baseUrl}/failed?tx_ref=${tx_ref}`, // Use same parameter name as Flutterwave
            webhook: `${baseUrl}/webhook/campay`
        };

        console.log('Redirect URLs:', redirectUrls);

        const response = await axios.post(
            'https://campay.net/api/collect/',
            {
                amount: amount,
                currency: "XAF",
                description: "Payment",
                external_reference: tx_ref,
                redirect_url: redirectUrls.success,
                failure_url: redirectUrls.failure,
                webhook_url: redirectUrls.webhook,
                from: phone.startsWith('237') ? phone : `237${phone}`
            },
            {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        ).catch(error => {
            console.error('Campay API Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        });

        // Save the payment with tx_ref like Flutterwave
        const payment = new Payment({
            name,
            email,
            phone: phone.startsWith('237') ? phone : `237${phone}`,
            amount: Number(amount),
            paymentMethod: 'campay',
            reference: response.data.reference,
            tx_ref: tx_ref, // Add this
            status: 'PENDING'
        });
        await payment.save();

        res.json({
            ...response.data,
            tx_ref // Include this in response
        });
    } catch (error) {
        console.error('Campay payment error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Failed to initiate payment',
            details: error.response?.data?.message || error.message,
            errorCode: error.response?.status || 500
        });
    }
});

// Add this near the top with other environment variables
const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH; // Add this to your .env file

// Add Flutterwave webhook handler
app.post('/api/flw-webhook', async (req, res) => {
    try {
        // Verify webhook signature
        const secretHash = req.headers['verif-hash'];
        if (!secretHash || secretHash !== FLW_SECRET_HASH) {
            console.log('Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        const payload = req.body;
        console.log('Flutterwave Webhook received:', payload);

        // Handle different webhook events
        switch (payload.event) {
            case 'charge.completed':
                if (payload.data.status === 'successful') {
                    await Payment.findOneAndUpdate(
                        { tx_ref: payload.data.tx_ref },
                        { 
                            status: 'SUCCESSFUL',
                            transactionId: payload.data.id,
                            updatedAt: new Date()
                        }
                    );
                }
                break;

            case 'charge.failed':
                await Payment.findOneAndUpdate(
                    { tx_ref: payload.data.tx_ref },
                    { 
                        status: 'FAILED',
                        updatedAt: new Date()
                    }
                );
                break;

            case 'transfer.completed':
                // Handle transfer completion
                console.log('Transfer completed:', payload.data);
                break;

            default:
                console.log('Unhandled webhook event:', payload.event);
        }

        res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Update the Flutterwave payment initiation endpoint
app.post('/api/initiate-flutterwave-payment', async (req, res) => {
    try {
        // Validate required fields
        const { name, email, phone, amount } = req.body;
        if (!name || !email || !phone || !amount) {
            console.error('Missing required fields:', req.body);
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Name, email, phone, and amount are required'
            });
        }

        console.log('Initiating Flutterwave payment with data:', {
            name, email, phone, amount
        });
        
        let phoneNumber = phone;
        if (!phoneNumber.startsWith('237')) {
            phoneNumber = '237' + phoneNumber;
        }

        const tx_ref = `FLW-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        
        // Save payment to MongoDB
        const payment = new Payment({
            name,
            email,
            phone: phoneNumber,
            amount,
            paymentMethod: 'flutterwave',
            tx_ref,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await payment.save();
        
        const payload = {
            tx_ref,
            amount,
            currency: "XAF",
            country: "CM",
            email,
            phone_number: phoneNumber,
            fullname: name
        };

        console.log('Sending payload to Flutterwave:', payload);

        const response = await flw.MobileMoney.franco_phone(payload)
            .catch(error => {
                console.error('Flutterwave API Error:', {
                    message: error.message,
                    data: error.response?.data
                });
                throw error;
            });

        console.log('Flutterwave Response:', response);

        if (!response || response.status === 'error') {
            throw new Error(response?.message || 'Payment initialization failed');
        }

        const responseData = {
            status: 'success',
            message: 'Payment initiated',
            data: response.data,
            payment_type: response.data?.payment_type,
            ussd_code: response.data?.ussd_code,
            flw_ref: response.data?.flw_ref,
            tx_ref: response.data?.tx_ref
        };

        res.json(responseData);

    } catch (error) {
        console.error('Flutterwave payment error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });
        
        res.status(500).json({ 
            error: 'Payment initiation failed', 
            details: error.response?.data?.message || error.message,
            errorCode: error.response?.status || 500
        });
    }
});

// Update the Flutterwave payment status check endpoint
app.get('/api/check-flw-payment-status/:tx_ref', async (req, res) => {
    try {
        const tx_ref = req.params.tx_ref;
        
        // Get the payment from database first
        const payment = await Payment.findOne({ tx_ref });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Check with Flutterwave API
        const response = await axios.get(
            `https://api.flutterwave.com/v3/transactions?tx_ref=${tx_ref}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
                }
            }
        );

        if (!response.data.data || response.data.data.length === 0) {
            return res.json({ status: 'PENDING' });
        }

        const transaction = response.data.data[0];
        
        // Update payment status in database
        await Payment.findByIdAndUpdate(payment._id, {
            status: transaction.status.toUpperCase(),
            updatedAt: new Date(),
            paymentDetails: transaction
        });

        res.json({
            status: transaction.status,
            data: transaction
        });
    } catch (error) {
        console.error('Flutterwave status check error:', error);
        res.status(500).json({ 
            error: 'Failed to check payment status',
            details: error.message || 'An error occurred'
        });
    }
});

// Update the manual status check endpoint
app.post('/api/manual-status-check', async (req, res) => {
    try {
        const { reference, paymentMethod } = req.body;
        console.log('Manual status check for:', { reference, paymentMethod });

        // First check our database
        let order = await CardOrder.findOne({
            $or: [
                { reference },
                { transaction_id: reference },
                { tx_ref: reference },
                { flw_ref: reference }
            ]
        });

        if (!order) {
            order = await TopUpOrder.findOne({
                $or: [
                    { reference },
                    { transaction_id: reference },
                    { tx_ref: reference },
                    { flw_ref: reference }
                ]
            });
        }

        if (order && order.status !== 'PENDING') {
            console.log('Order found in database:', order);
            return res.json({ status: order.status });
        }

        // If pending or not found, check with payment provider
        if (paymentMethod === 'FLUTTERWAVE') {
            const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
            try {
                const response = await flw.Transaction.verify({ id: reference });
                console.log('Flutterwave verification response:', response);

                if (response.data.status === "successful" && order) {
                    order.status = 'SUCCESSFUL';
                    await order.save();
                }

                return res.json({
                    status: response.data.status === "successful" ? 'SUCCESSFUL' : 'PENDING',
                    amount: response.data.amount,
                    currency: response.data.currency,
                    reference: reference
                });
            } catch (flwError) {
                console.error('Flutterwave verification error:', flwError);
                return res.json({ status: order?.status || 'PENDING' });
            }
        } else if (paymentMethod === 'CAMPAY') {
            try {
                const token = await getNewCampayToken();
                const response = await axios.get(
                    `https://campay.net/api/transaction/${reference}/`,
                    {
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('Campay response:', response.data);

                // Map the status
                let status = 'PENDING';
                if (response.data.status === 'successful') status = 'SUCCESSFUL';
                if (response.data.status === 'failed') status = 'FAILED';

                // Update the order in our database if found
                if (order) {
                    order.status = status;
                    await order.save();
                }

                return res.json({
                    status,
                    amount: response.data.amount,
                    currency: 'XAF',
                    reference: reference
                });
            } catch (campayError) {
                console.error('Campay verification error:', campayError);
                return res.json({ status: order?.status || 'PENDING' });
            }
        }

        // If no specific payment method handler, return current status
        return res.json({ 
            status: order?.status || 'PENDING',
            message: 'Could not verify payment status'
        });

    } catch (error) {
        console.error('Manual status check error:', error);
        // Don't send error to client, just return current status
        res.json({ status: 'PENDING' });
    }
});

app.post('/webhook/campay', async (req, res) => {
    console.log('Campay webhook received:', req.body);
    try {
        const { status, transaction_id, external_reference } = req.body;
        
        // Try to find the order in both TopUpOrder and CardOrder
        let order = await TopUpOrder.findOne({ 
            $or: [
                { tx_ref: external_reference },
                { reference: transaction_id }
            ]
        });

        if (!order) {
            // If not found in TopUpOrder, try CardOrder
            order = await CardOrder.findOne({
                $or: [
                    { tx_ref: external_reference },
                    { reference: transaction_id }
                ]
            });
        }

        if (!order) {
            console.error('Order not found for reference:', external_reference);
            return res.status(404).json({ error: 'Order not found' });
        }

        if (status === 'successful') {
            order.status = 'SUCCESSFUL';
            if (order.payment_details) {
                order.payment_details.completedAt = new Date().toISOString();
            } else {
                order.payment_details = {
                    completedAt: new Date().toISOString()
                };
            }
            await order.save();

            // Send notification based on order type
            if (order.cardType) { // This is a CardOrder
                await sendCardOrderNotification(order);
            } else { // This is a TopUpOrder
                await sendTopUpNotification(order);
            }

            console.log('Order updated successfully:', order);
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Only log in development and only for errors
app.use((req, res, next) => {
    // Skip logging for common API endpoints
    const skipPaths = [
        '/api/admin/sent-cards',
        '/api/admin/profile',
        '/api/admin/transactions'
    ];
    
    if (process.env.NODE_ENV === 'development' && 
        !skipPaths.some(path => req.url.startsWith(path))) {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// Add this webhook handler after your existing routes
app.post('/api/webhook/campay', async (req, res) => {
    try {
        console.log('=== Campay Webhook Received ===');
        console.log('Webhook Data:', req.body);

        const { reference, status } = req.body;

        // Find and update the order
        const order = await Order.findOne({ reference });
        if (!order) {
            console.log('Order not found for reference:', reference);
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status
        order.status = status.toUpperCase();
        await order.save();

        console.log(`Order ${order._id} status updated to ${status}`);

        // Send success response to Campay
        res.json({ status: 'success' });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Remove or comment out this general verify-payment endpoint
// app.post('/api/verify-payment', async (req, res) => { ... });

// Instead, make sure these routes are registered in the correct order
app.use('/api/admin', adminRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', topUpRoutes);
app.use('/api', cardOrderRoutes);  // This should handle /api/verify-payment

// Remove any duplicate route registrations

// Add the email routes
app.use('/api', emailRoutes);

// Add or update these route configurations
app.use('/api/admin', require('./routes/cardManagementRoutes')); // Mount card management routes under /api/admin

// Add this after your routes are set up
generateSitemap(app);

// Add a route to serve the sitemap
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sitemap.xml'));
});

// Update email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true,
    logger: true
});

// Verify email configuration on startup
transporter.verify()
    .then(() => {
        console.log('Email configuration verified successfully');
        console.log('Email settings:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER
        });
    })
    .catch((error) => {
        console.error('Email configuration error:', error);
    });

// Add the SMS routes
app.use('/api/sms', smsRoutes);

// Health check endpoint
app.get('/api/admin/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Detailed system status
app.get('/api/admin/status', async (req, res) => {
    try {
        const status = {
            server: {
                uptime: process.uptime(),
                timestamp: new Date(),
                pid: process.pid,
                memory: process.memoryUsage(),
            },
            database: {
                status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                host: mongoose.connection.host,
                name: mongoose.connection.name,
            },
            email: {
                configured: !!transporter,
                host: process.env.SMTP_HOST,
            },
            environment: process.env.NODE_ENV || 'development'
        };
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Payment services health check
app.get('/api/admin/payment-status', async (req, res) => {
    try {
        const status = {
            campay: {
                configured: !!process.env.CAMPAY_USERNAME && !!process.env.CAMPAY_PASSWORD,
                tokenStatus: !!campayToken && tokenExpiry > new Date()
            },
            flutterwave: {
                configured: !!process.env.FLW_PUBLIC_KEY && !!process.env.FLW_SECRET_KEY
            }
        };
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh Campay token endpoint
app.post('/api/admin/refresh-campay-token', async (req, res) => {
    try {
        const token = await getNewCampayToken();
        res.json({
            success: true,
            tokenStatus: !!token,
            expiresAt: tokenExpiry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add automatic token refresh
const refreshCampayToken = async () => {
    try {
        if (!campayToken || !tokenExpiry || new Date() > tokenExpiry) {
            console.log('Refreshing Campay token...');
            await getNewCampayToken();
        }
    } catch (error) {
        console.error('Token refresh error:', error.message);
    }
};

// Refresh token every 50 minutes
setInterval(refreshCampayToken, 50 * 60 * 1000);

// Initial token refresh on startup
refreshCampayToken();

// ... rest of the file ... 