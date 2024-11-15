import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  assignTitle,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
const router = express.Router();

//get routes
router.get("/profile", auth, getUserProfile);

//post routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/assign-title", auth, role("faculty", "hod", "dev"), assignTitle);

export default router;
