require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const axios = require('axios');
const { exec } = require('child_process');
const cardOrderRoutes = require('./routes/cardOrderRoutes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars setup
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

let ngrokUrl;

// Initialize ngrok using command line
function initNgrok() {
    return new Promise((resolve, reject) => {
        exec(`ngrok start payment --config=./ngrok.yml`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error starting ngrok:', error);
                reject(error);
                return;
            }
            // The URL will be available at http://localhost:4040/api/tunnels
            setTimeout(async () => {
                try {
                    const response = await axios.get('http://localhost:4040/api/tunnels');
                    ngrokUrl = response.data.tunnels[0].public_url;
                    console.log('Ngrok URL:', ngrokUrl);
                    resolve(ngrokUrl);
                } catch (err) {
                    console.error('Error getting ngrok URL:', err);
                    reject(err);
                }
            }, 1000);
        });
    });
}

// Routes
app.get('/', (req, res) => {
    res.render('payment-form');
});

app.get('/success', (req, res) => {
    res.render('success');
});

app.get('/failed', (req, res) => {
    res.render('failed');
});

// Webhook handler
app.post('/webhook', async (req, res) => {
    try {
        console.log('Webhook received at:', new Date().toISOString());
        console.log('Headers:', req.headers);
        console.log('Body:', JSON.stringify(req.body, null, 2));
        
        const { event, data } = req.body;
        
        switch (event) {
            case 'collection.successful':
                console.log('Payment successful:', data);
                // Here you can update your database or perform other actions
                break;
                
            case 'collection.failed':
                console.log('Payment failed:', data);
                // Handle failed payment
                break;
                
            default:
                console.log('Unhandled webhook event:', event);
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook processing failed' });
    }
});

app.get('/check-payment-status/:reference', async (req, res) => {
    try {
        const reference = req.params.reference;
        
        // Get new token for status check
        const tokenResponse = await axios.post('https://campay.net/api/token/', {
            username: process.env.CAMPAY_USERNAME,
            password: process.env.CAMPAY_PASSWORD
        });

        const token = tokenResponse.data.token;

        // Check payment status
        const statusResponse = await axios.get(`https://campay.net/api/transaction/${reference}/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });

        res.json(statusResponse.data);
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

app.post('/initiate-payment', async (req, res) => {
    try {
        console.log('Initiating payment process...', req.body);
        
        // Format phone number
        let phoneNumber = req.body.phone;
        if (!phoneNumber.startsWith('237')) {
            phoneNumber = '237' + phoneNumber;
        }
        
        // Remove any spaces or special characters
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        
        // Validate phone number
        if (phoneNumber.length !== 12) { // 237 + 9 digits
            throw new Error('Invalid phone number format. Must be 237XXXXXXXXX');
        }
        
        console.log('Requesting token...');
        const tokenResponse = await axios.post('https://campay.net/api/token/', {
            username: process.env.CAMPAY_USERNAME,
            password: process.env.CAMPAY_PASSWORD
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        const token = tokenResponse.data.token;
        console.log('Token received successfully');

        console.log('Initiating payment with Campay...');
        const paymentResponse = await axios.post('https://campay.net/api/collect/', {
            amount: "100",
            currency: "XAF",
            from: phoneNumber,
            description: "Payment from " + req.body.name,
            external_reference: Date.now().toString(),
            redirect_url: `${ngrokUrl}/success`,
            failure_url: `${ngrokUrl}/failed`,
            webhook_url: `${ngrokUrl}/webhook`
        }, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('Payment response from Campay:', paymentResponse.data);
        
        // Handle both USSD and redirect URL cases
        if (paymentResponse.data.ussd_code || paymentResponse.data.payment_url) {
            res.json(paymentResponse.data);
        } else {
            throw new Error('Invalid payment response from service');
        }
    } catch (error) {
        console.error('Payment Error Details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            stack: error.stack
        });

        if (error.message.includes('Invalid phone number')) {
            res.status(400).json({
                error: 'Invalid phone number format',
                details: 'Phone number must be in format: 237XXXXXXXXX'
            });
        } else if (error.code === 'ENOTFOUND') {
            res.status(500).json({ 
                error: 'Cannot connect to payment service. Please check your internet connection.',
                details: error.message 
            });
        } else {
            res.status(500).json({ 
                error: 'Payment initiation failed', 
                details: error.response?.data || error.message 
            });
        }
    }
});

app.use('/api', cardOrderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await initNgrok();
    } catch (error) {
        console.error('Failed to initialize ngrok:', error);
    }
});

// Handle cleanup on server shutdownn
process.on('SIGTERM', async () => {
    await ngrok.kill();
    process.exit(0);
}); 