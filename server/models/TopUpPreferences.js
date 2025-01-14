const mongoose = require('mongoose');

const topUpPreferencesSchema = new mongoose.Schema({
    cardId: {
        type: String,
        required: true,
        index: true
    },
    lastAmount: {
        type: Number,
        default: null
    },
    favoriteAmounts: [{
        type: Number,
        default: []
    }],
    lastPaymentMethod: {
        type: String,
        enum: ['CAMPAY', 'FLUTTERWAVE', null],
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('TopUpPreferences', topUpPreferencesSchema); 