const express = require('express');
const router = express.Router();
const Bed = require('../models/Bed');
const authMiddleware = require('../middleware/auth'); // Fixed import

// Get all beds
router.get('/', authMiddleware.auth, async (req, res) => {
    try {
        const beds = await Bed.find().populate('patientId', 'name age condition');
        res.json(beds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bed statistics
router.get('/stats', authMiddleware.auth, async (req, res) => {
    try {
        const totalBeds = await Bed.countDocuments();
        const availableBeds = await Bed.countDocuments({ status: 'available' });
        const occupiedBeds = await Bed.countDocuments({ status: 'occupied' });
        const maintenanceBeds = await Bed.countDocuments({ status: 'maintenance' });
        
        const statsByType = await Bed.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    available: {
                        $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
                    }
                }
            }
        ]);
        
        res.json({
            total: totalBeds,
            available: availableBeds,
            occupied: occupiedBeds,
            maintenance: maintenanceBeds,
            byType: statsByType
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update bed status
router.put('/:id', authMiddleware.auth, async (req, res) => {
    try {
        const bed = await Bed.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(bed);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;