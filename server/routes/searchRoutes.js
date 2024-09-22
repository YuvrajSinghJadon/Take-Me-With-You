import express from "express";
import { searchResults } from "../controllers/searchController.js";
import userAuth from "../middleware/authMiddleware.js"; // Assuming you have the auth middleware

const router = express.Router();

// Define the search route
router.get("/search", userAuth, searchResults);

export default router;
