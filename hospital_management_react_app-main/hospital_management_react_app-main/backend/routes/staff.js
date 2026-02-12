const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // Fixed import

// Get all staff (admin only)
router.get('/', authMiddleware.auth, async (req, res) => {
    try {
        const staff = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get staff by department
router.get('/department/:dept', authMiddleware.auth, async (req, res) => {
    try {
        const staff = await User.find({ 
            department: req.params.dept,
            isApproved: true
        }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get available staff (on duty)
router.get('/available/:role', authMiddleware.auth, async (req, res) => {
    try {
        const availableStaff = await User.find({
            role: req.params.role,
            isApproved: true
        }).select('name role department specialization contact');
        res.json(availableStaff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update staff details (admin only)
router.put('/:id', authMiddleware.adminAuth, async (req, res) => {
    try {
        const staff = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete staff (admin only)
router.delete('/:id', authMiddleware.adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff member deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get staff statistics
router.get('/stats', authMiddleware.auth, async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    available: {
                        $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] }
                    }
                }
            }
        ]);
        
        const departmentStats = await User.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            byRole: stats,
            byDepartment: departmentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;