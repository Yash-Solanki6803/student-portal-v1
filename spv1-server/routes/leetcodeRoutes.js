import express from "express";
import auth from "../middleware/auth.js";
import { updateLeetcodeDetails } from "../controllers/leetcodeController.js";
const router = express.Router();

//dev can assign any role
router.post("/update-details", auth, updateLeetcodeDetails);

export default router;
