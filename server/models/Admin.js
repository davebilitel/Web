const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Super Admin'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: 'Cameroon'
    },
    profileImage: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff'
    },
    role: {
        type: String,
        default: 'admin'
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: null
    },
    backupCodes: [{
        code: String,
        used: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

// Password hash middleware
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema); 