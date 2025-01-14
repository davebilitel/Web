require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createInitialAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const admin = new Admin({
            name: 'Super Admin',
            email: 'admin@example.com',
            password: 'admin123',
            phone: '+237 000 000 000',
            country: 'Cameroon',
            profileImage: 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff'
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createInitialAdmin(); 