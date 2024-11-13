const express = require('express');
const { registerUser, loginUser ,getUserProfile} = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

//get routes
router.get('/profile', auth, getUserProfile);

//post routes
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
