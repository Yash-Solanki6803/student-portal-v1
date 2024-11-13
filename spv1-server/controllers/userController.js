const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
     // Check if the user already exists
     const existingUser = await User.findOne({ email });
     if (existingUser) {
       return res.status(400).json({ message: 'User already exists' });
     }

     //User Doesn't exist
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  //get data from request
  const { email, password } = req.body;


 try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };


    // Create the JWT token (you can change the secret key)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send the token back to the client
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // Find the user from the database using the user ID decoded from the JWT
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send back the user profile data
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser ,getUserProfile};
