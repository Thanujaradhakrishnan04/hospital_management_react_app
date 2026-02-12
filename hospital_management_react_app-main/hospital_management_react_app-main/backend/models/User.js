const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    role: {
        type: String,
        enum: ['admin', 'doctor', 'nurse', 'technician', 'pharmacist', 'janitor', 'receptionist'],
        required: true
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    department: {
        type: String,
        enum: ['emergency', 'icu', 'general', 'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'radiology', 'pharmacy', 'maintenance'],
        default: 'general'
    },
    contact: {
        type: String
    },
    specialization: {
        type: String
    },
    shift: {
        type: String,
        enum: ['morning', 'evening', 'night', 'general'],
        default: 'general'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
