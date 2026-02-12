const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const authMiddleware = require('../middleware/auth'); // Fixed import

// Get all patients
router.get('/', authMiddleware.auth, async (req, res) => {
    try {
        const patients = await Patient.find().populate('assignedDoctor assignedNurse', 'name role');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new patient
router.post('/', authMiddleware.auth, async (req, res) => {
    try {
        // Find available bed
        const availableBed = await Bed.findOne({ 
            status: 'available',
            department: req.body.department || 'general'
        });
        
        if (!availableBed) {
            return res.status(400).json({ message: 'No available beds' });
        }
        
        const patient = new Patient({
            ...req.body,
            bedId: availableBed._id,
            status: 'admitted'
        });
        
        await patient.save();
        
        // Update bed status
        availableBed.status = 'occupied';
        availableBed.patientId = patient._id;
        await availableBed.save();
        
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update patient
router.put('/:id', authMiddleware.auth, async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete patient
router.delete('/:id', authMiddleware.auth, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        
        if (patient && patient.bedId) {
            // Free the bed
            await Bed.findByIdAndUpdate(patient.bedId, {
                status: 'available',
                patientId: null
            });
        }
        
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Discharge patient
router.post('/:id/discharge', authMiddleware.auth, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        
        patient.status = 'discharged';
        patient.dischargeDate = new Date();
        await patient.save();
        
        // Free the bed
        if (patient.bedId) {
            await Bed.findByIdAndUpdate(patient.bedId, {
                status: 'available',
                patientId: null
            });
        }
        
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;