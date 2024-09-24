// routes/smsRoutes.js
import express from "express";
import { sendNotification } from "../controllers/smsController.js";

const router = express.Router();

// POST route for sending notifications
router.post("/send-notification", sendNotification);

export default router;
