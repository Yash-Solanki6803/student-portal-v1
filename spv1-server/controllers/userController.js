// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const db = require('../config/db'); // Import the db instance
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import userQueires from "../queries/userQueires.js";

// Register a new user
const registerUser = async (req, res) => {
  const {
    username,
    first_name,
    middle_name,
    last_name,
    email,
    profile_picture_url,
    branch,
    division,
    leetcode_id,
    password,
  } = req.body;

  if (!username || !first_name || !last_name || !email) {
    return res
      .status(400)
      .json({ message: "Please enter all the required fields" });
  }

  try {
    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt);
    // Hash the password

    const registerUserQuery = userQueires.registerUser;
    const values = [
      username,
      first_name,
      middle_name,
      last_name,
      email,
      profile_picture_url,
      branch,
      division,
      leetcode_id,
      "student",
      hashedPassword,
    ];

    const result = await db.query(registerUserQuery, values);
    // Send back the newly created user details (without password)
    const { password: _, ...userWithoutPassword } = result.rows[0];
    res.status(201).json({
      message: "User registered successfully!",
      user: userWithoutPassword, // Send the user details without the password
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user has entered the username or email
  if (!username && !email) {
    return res
      .status(400)
      .json({ message: "Please enter your username or email" });
  }
  if (!password) {
    return res.status(400).json({ message: "Please enter your password" });
  }

  try {
    const query = username
      ? userQueires.getUserByUsername
      : userQueires.getUserByEmail;
    const value = [username || email];
    const result = await db.query(query, value);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token as an HTTP-only cookie
    res.cookie("spv1-auth", token, {
      httpOnly: true, // Prevent JavaScript access
      secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
      sameSite: "Strict",
      maxAge: 3600000, // 1 hour
    });

    // Send back the user details (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // The user ID will be available in the request object after the auth middleware
    const userId = req.user.id;

    const query = userQueires.getUserProfileFromId;

    const result = await db.query(query, [userId]);

    // If no user is found, return an error
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user profile as a response
    res.status(200).json({
      message: "User profile retrieved successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Assign a title to a user
const assignTitle = async (req, res) => {
  const { title, username } = req.body; //username is the user to whom the title is to be assigned
  const assigningUserId = req.user.id; // The userId of the user making the request
  try {
    const query = userQueires.assignTitleFromUsername;
    const values = [title, assigningUserId, username];
    const result = await db.query(query, values);
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Title assigned successfully" });
    } else {
      res.status(404).json({ error: "Student not found or invalid role" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error assigning title" });
  }
};

export { registerUser, loginUser, getUserProfile, assignTitle };
