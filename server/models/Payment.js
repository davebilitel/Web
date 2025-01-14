const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    amount: Number,
    paymentMethod: String,
    reference: String,
    tx_ref: String,
    external_reference: String,
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
        default: 'PENDING'
    },
    transactionId: String,
    paymentDetails: Object,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', paymentSchema); 