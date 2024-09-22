//index.js
import express from "express";
import authRoute from "./authRoutes.js";
import userRoute from "./userRoutes.js";
import postRoute from "./postRoutes.js";

const router = express.Router();

// Auth routes
router.use(`/auth`, authRoute);

// User routes
router.use(`/users`, userRoute);

// Post routes
router.use(`/posts`, postRoute);

export default router;
