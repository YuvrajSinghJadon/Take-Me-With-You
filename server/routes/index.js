//index.js
import express from "express";
import authRoute from "./authRoutes.js";
import userRoute from "./userRoutes.js";
import postRoute from "./postRoutes.js";
import searchRoutes from "./searchRoutes.js";
import expanseRoutes from "./expanseRoutes.js";
import nativeRoutes from "./nativeRoutes.js";

const router = express.Router();

// Auth routes
router.use(`/auth`, authRoute);

// User routes
router.use(`/users`, userRoute);

// Native Routes
router.use("/natives", nativeRoutes);

// Post routes
router.use(`/posts`, postRoute);

//Search Routes
router.use("/", searchRoutes);

//expanse Routes
router.use("/expanses", expanseRoutes);

export default router;
