//index.js
import express from "express";
import authRoute from "./authRoutes.js";
import userRoute from "./userRoutes.js";
import postRoute from "./postRoutes.js";
import searchRoutes from "./searchRoutes.js";
import smsRoutes from "./smsRoutes.js";
const router = express.Router();

// Auth routes
router.use(`/auth`, authRoute);

// User routes
router.use(`/users`, userRoute);

// Post routes
router.use(`/posts`, postRoute);

//Search Routes
router.use("/", searchRoutes);

// Use your SMS routes
router.use("/", smsRoutes);

export default router;
