import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/userController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

//get routes
router.get('/profile', auth, getUserProfile);

//post routes
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
