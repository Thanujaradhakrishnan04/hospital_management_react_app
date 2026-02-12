const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected Successfully');
        
        // Initialize beds if not exists
        await initializeBeds();
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const initializeBeds = async () => {
    const Bed = require('../models/Bed');
    const bedCount = await Bed.countDocuments();
    
    if (bedCount === 0) {
        console.log('Initializing beds...');
        const beds = [];
        const bedTypes = ['general', 'icu', 'emergency', 'isolation', 'step-down'];
        const departments = ['Emergency', 'ICU', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'];
        
        for (let i = 1; i <= 50; i++) {
            const roomNum = Math.floor((i-1)/4) + 100; // 4 beds per room
            beds.push({
                bedNumber: `B${i.toString().padStart(3, '0')}`,
                roomNumber: `R${roomNum}`,
                type: bedTypes[Math.floor(Math.random() * bedTypes.length)],
                status: 'available',
                department: departments[Math.floor(Math.random() * departments.length)],
                equipment: []
            });
        }
        
        await Bed.insertMany(beds);
        console.log('50 beds initialized');
    }
};

module.exports = connectDB;