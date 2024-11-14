import express from "express";
import { assignRole } from "../controllers/roleController.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

//dev can assign any role
router.post("/assign-role-dev", auth, role("dev"), assignRole);

//hod can assign faculty or student
router.post("/assign-role", auth, role("hod"), assignRole);

export default router;
