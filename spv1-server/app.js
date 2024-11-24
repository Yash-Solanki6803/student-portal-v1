import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

// Connect to the database

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/leetcode", leetcodeRoutes);

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
