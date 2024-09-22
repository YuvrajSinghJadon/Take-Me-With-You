//authRoutes.js
import express from "express";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

// Register and Login routes
router.post("/register", register);
router.post("/login", login);

export default router;
