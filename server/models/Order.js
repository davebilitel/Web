const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        name: String,
        email: String,
        phone: String
    },
    card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
        required: false
    },
    cardType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['CAMPAY', 'FLUTTERWAVE']
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
        default: 'PENDING'
    },
    reference: String,
    tx_ref: String,
    flw_ref: String,
    transaction_id: String,
    payment_details: Object,
    country: {
        type: String,
        enum: ['CM', 'SN', 'BF', 'CI', 'RW', 'UG', 'KE'],
        required: true,
        default: 'CM'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema); 