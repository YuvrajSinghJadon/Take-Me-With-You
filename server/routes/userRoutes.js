//userRoutes.js
import express from "express";
import {
  acceptRequest,
  changePassword,
  friendRequest,
  getUserById,
  profileViews,
  requestPasswordReset,
  resetPassword,
  suggestedFriends,
  updateUser,
  getUserGroups,
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();

// Password reset
router.post("/request-passwordreset", requestPasswordReset);
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/reset-password", changePassword);

// User-related routes
// GET user by ID
router.get("/get-user/:id", userAuth, getUserById);
router.put(
  "/update-user",
  userAuth,
  upload.single("profilePicture"),
  updateUser
);

// Friend requests
router.post("/friend-request", userAuth, friendRequest);

// Route to get all groups the user is part of
router.get("/user-groups", userAuth, getUserGroups);

// Accept/deny friend requests
router.post("/accept-request", userAuth, acceptRequest);

// Profile view
router.post("/profile-view", userAuth, profileViews);

// Suggested friends
router.post("/suggested-friends", userAuth, suggestedFriends);

// For frontend routes (Optional, if you're still serving static files for your frontend in production)
router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

export default router;
