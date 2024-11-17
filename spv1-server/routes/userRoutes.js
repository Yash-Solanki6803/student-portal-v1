import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  assignTitle,
  logoutUser,
  changePassword,
  updateUserProfile,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
const router = express.Router();

//get routes
router.get("/profile", auth, getUserProfile);

//post routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", auth, logoutUser);
router.post("/assign-title", auth, role("faculty", "hod", "dev"), assignTitle);
router.post("/change-password", auth, changePassword);
router.post("/update-profile", auth, updateUserProfile);

export default router;
