const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
    origin: [
        'https://hospital-management-frontend-afbz.onrender.com',  // ✅ No trailing slash
        'http://localhost:3000' // Your frontend URL (update this)
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/Patient'));
app.use('/api/beds', require('./routes/beds'));
app.use('/api/staff', require('./routes/staff'));

// Health check endpoint (important for Render)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Hospital Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
