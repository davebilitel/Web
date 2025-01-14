const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    messageId: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        default: 'received'
    }
});

module.exports = mongoose.model('Message', messageSchema); 