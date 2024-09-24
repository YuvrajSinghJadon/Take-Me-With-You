//authRoutes.js
import express from "express";
import { login, register , verifyEmail} from "../controllers/authController.js";

const router = express.Router();

// Register and Login routes
router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);

export default router;
