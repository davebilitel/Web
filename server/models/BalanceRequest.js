const mongoose = require('mongoose');

const balanceRequestSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true
    },
    cardNumber: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    balance: Number,
    error: String
});

module.exports = mongoose.model('BalanceRequest', balanceRequestSchema); 