const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true,
        enum: ['CM', 'SN', 'BF', 'CI', 'RW', 'UG', 'KE']
    },
    currency: {
        type: String,
        required: true,
        enum: ['XAF', 'XOF', 'RWF', 'UGX', 'KES']
    },
    rateToUSD: {
        type: Number,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema); 