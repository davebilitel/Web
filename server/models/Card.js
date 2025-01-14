const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true,
        unique: true
    },
    firstSixDigits: {
        type: String,
        required: true
    },
    lastFourDigits: {
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
    type: {
        type: String,
        enum: ['VISA', 'MASTERCARD'],
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
        default: 'ACTIVE'
    },
    balance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema); 