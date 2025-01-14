const mongoose = require('mongoose');

const cardOrderSchema = new mongoose.Schema({
    cardType: {
        type: String,
        required: true,
        enum: ['VISA', 'MASTERCARD']
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
    processed: {
        type: Boolean,
        default: false
    },
    reference: String,
    tx_ref: String,
    flw_ref: String,
    transaction_id: String,
    payment_details: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CardOrder', cardOrderSchema); 