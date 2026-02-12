const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // Fixed import

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department, contact } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user (pending admin approval)
        user = new User({
            name,
            email,
            password,
            role,
            department,
            contact,
            isApproved: true // Auto-approve to all people as of now
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if approved (except admin)
        if (!user.isApproved && user.role !== 'admin') {
            return res.status(400).json({ message: 'Account pending admin approval' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user
router.get('/me', authMiddleware.auth, async (req, res) => { // Fixed: use authMiddleware.auth
    res.json(req.user);
});

// Admin: Get pending approvals
router.get('/pending', authMiddleware.auth, async (req, res) => { // Fixed: use authMiddleware.auth
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const pendingUsers = await User.find({ isApproved: false });
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin: Approve user
router.put('/approve/:id', authMiddleware.auth, async (req, res) => { // Fixed: use authMiddleware.auth
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isApproved = true;
        await user.save();

        res.json({ message: 'User approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
