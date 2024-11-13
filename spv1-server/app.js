const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
