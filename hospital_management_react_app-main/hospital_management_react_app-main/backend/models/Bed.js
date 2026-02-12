const mongoose = require('mongoose');

const BedSchema = new mongoose.Schema({
    bedNumber: {
        type: String,
        required: true,
        unique: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'icu', 'emergency', 'isolation', 'step-down', 'pediatric', 'maternity'],
        default: 'general'
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance', 'reserved'],
        default: 'available'
    },
    department: {
        type: String,
        required: true
    },
    equipment: [{
        name: String,
        status: String
    }],
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    occupancyHistory: [{
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
        admissionDate: Date,
        dischargeDate: Date
    }]
});

module.exports = mongoose.model('Bed', BedSchema);