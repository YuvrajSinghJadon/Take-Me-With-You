//authRoutes.js
import express from "express";
import { login, register, verifyEmail } from "../controllers/authController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();

// Register and Login routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);

export default router;
