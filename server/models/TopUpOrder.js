const mongoose = require('mongoose');

const topUpOrderSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true
    },
    cardNumber: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    amountUSD: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    country: {
        type: String,
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
    payment_details: {
        type: Map,
        of: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    emailConfirmed: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('TopUpOrder', topUpOrderSchema); 