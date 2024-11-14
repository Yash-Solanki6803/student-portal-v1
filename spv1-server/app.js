import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables
dotenv.config();

// Connect to the database

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
