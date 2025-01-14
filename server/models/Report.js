const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    reportType: {
        type: String,
        enum: ['transactions', 'revenue', 'users', 'cards'],
        required: true
    },
    filters: {
        type: Object,
        default: {}
    },
    lastGenerated: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema); 