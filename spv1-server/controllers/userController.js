import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import userQueires from "../queries/userQueires.js";
import { isValidEmail } from "../lib/utils/index.js";

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

    //Check if the email is valid
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    //Check if the email is already registered
    const emailCheckQuery = userQueires.checkEmailExists;
    const emailCheckResult = await db.query(emailCheckQuery, [email]);

    if (emailCheckResult.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    //Check if the username is already registered
    const usernameCheckQuery = userQueires.getUserByUsername;
    const usernameCheckResult = await db.query(usernameCheckQuery, [username]);

    if (usernameCheckResult.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Register the user
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

//Logout a user
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("spv1-auth", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during logout" });
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
  const { title, slug, username } = req.body; //username is the user to whom the title is to be assigned
  const assigningUserId = req.user.id; // The userId of the user making the request
  try {
    const query = userQueires.assignTitleFromUsername;
    const values = [title, assigningUserId, username, slug];
    const result = await db.query(query, values);
    console.dir(result.rows, { depth: null });
    if (result.rowCount > 0) {
      switch (result.rows[0].result) {
        case "title_assigned":
          res.status(200).json({ message: "Title assigned successfully" });
          break;
        case "title_already_assigned":
          res.status(400).json({ error: "Title already assigned" });
          break;
        case "student_not_found":
          res.status(404).json({ error: "Student not found" });
          break;
        default:
          res.status(500).json({ error: "Unknown error" });
      }
    } else {
      res.status(404).json({ error: "Server Error" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error assigning title" });
  }
};

//Change password of user
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  //Check if required fields are present
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please enter all the required fields" });
  }

  try {
    const userId = req.user.id;
    const query = userQueires.getUserProfileFromId;
    const result = await db.query(query, [userId]);

    //If no user is found, return an error
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    //Update the password in the database
    const updatePasswordQuery = userQueires.updatePassword;
    const updatePasswordValues = [hashedPassword, userId];
    await db.query(updatePasswordQuery, updatePasswordValues);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error while changing password" });
  }
};

//Update user profile
const updateUserProfile = async (req, res) => {
  const allowedFields = [
    "first_name",
    "middle_name",
    "last_name",
    "username",
    "email",
    "profile_picture_url",
    "branch",
    "division",
    "leetcode_id",
  ]; // List of fields that can be updated

  const receivedData = req.body;
  try {
    const userId = req.user.id;

    // Filter out fields that aren't allowed
    const updates = Object.keys(receivedData).filter((field) =>
      allowedFields.includes(field)
    );

    // If no valid fields are provided
    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide valid fields to update." });
    }

    // Check if email is valid
    if (updates.includes("email")) {
      const { email } = req.body;

      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Please enter a valid email." });
      }

      const emailCheckQuery = userQueires.checkEmailExists;
      const emailCheckResult = await db.query(emailCheckQuery, [email, userId]);

      if (emailCheckResult.rows.length > 0) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }

    //Check if the username is already registered
    if (updates.includes("username")) {
      const { username } = req.body;
      const usernameCheckQuery = userQueires.getUserByUsername;
      const usernameCheckResult = await db.query(usernameCheckQuery, [
        username,
      ]);

      if (usernameCheckResult.rows.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }
    // Construct query dynamically
    const setClause = updates.map((field, index) => `${field} = $${index + 1}`);
    const values = updates.map((field) => receivedData[field]);
    values.push(userId); // Add userId for the WHERE clause

    const updateQuery = `
      UPDATE users
      SET ${setClause.join(", ")}
      WHERE id = $${updates.length + 1}
      RETURNING id, username, first_name, middle_name, last_name, email, profile_picture_url, branch, division, leetcode_id, role;
    `;
    // Execute the query
    const result = await db.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const updatedUser = result.rows[0];

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user profile" });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  assignTitle,
  changePassword,
  updateUserProfile,
};
