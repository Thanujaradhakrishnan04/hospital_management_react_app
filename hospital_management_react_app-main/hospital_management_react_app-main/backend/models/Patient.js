const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: String
    },
    address: {
        type: String
    },
    bloodGroup: {
        type: String
    },
    roomNumber: {
        type: String,
        required: true
    },
    bedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bed'
    },
    emergencyLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    condition: {
        type: String,
        required: true
    },
    symptoms: {
        type: [String]
    },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedNurse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    dischargeDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['admitted', 'discharged', 'transferred', 'in-treatment'],
        default: 'admitted'
    },
    insurance: {
        provider: String,
        policyNumber: String,
        coverage: Number
    },
    billing: {
        totalAmount: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        pendingAmount: { type: Number, default: 0 }
    },
    notes: {
        type: String
    }
});

module.exports = mongoose.model('Patient', PatientSchema);