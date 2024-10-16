import express from "express";
import userAuth, { authorizeRoles } from "../middleware/authMiddleware.js";

import {
  commentPost,
  createPost,
  deletePost,
  getComments,
  getPost,
  getPosts,
  getUserPost,
  replyPostComment,
  createJoinRequest,
  getJoinRequests,
  likeComment,
  likeReply,
  acceptJoinRequest,
  rejectJoinRequest,
  getGroupByPostId,
  removeUserFromGroup,
} from "../controllers/postController.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();
// Create a post with image
router.post(
  "/create-post",
  userAuth,
  authorizeRoles(["traveller"]),
  upload.single("image"),
  createPost
);

// Fetch all posts (homepage) - Authenticated route
router.get("/", userAuth, getPosts); // Protect this route with userAuth

// Fetch a single post by ID - Authenticated route
router.get("/:id", userAuth, getPost); // Protect this route with userAuth

// Fetch all posts by a specific user - Authenticated route
router.get("/get-user-post/:id", userAuth, getUserPost); // Protect this route with userAuth

// Fetch all posts by a specific user with join requests
router.get("/get-user-post-with-join-requests/:id", userAuth, getUserPost); // Protect this route with userAuth
// Get comments for a post
router.get("/comments/:postId", userAuth, getComments);

// Add a comment to a post
router.post("/comment/:id", userAuth, commentPost);

// Reply to a comment
router.post("/reply-comment/:id", userAuth, replyPostComment);

//Like comments and replies
router.post("/like-comment/:id", userAuth, likeComment);
router.post("/like-reply/:id/:replyId", userAuth, likeReply);

// Delete a post
router.delete("/:id", userAuth, deletePost);

// Create a join trip request
router.post("/join-request/:id", userAuth, createJoinRequest);

// Get all join requests for a specific trip
router.get("/join-requests/:id", userAuth, getJoinRequests);
// Accept and reject join requests
router.post("/accept-join-request/:requestId", userAuth, acceptJoinRequest);
router.post("/reject-join-request/:requestId", userAuth, rejectJoinRequest);

// Route to get group by post ID
router.get("/group/:postId", userAuth, getGroupByPostId);

router.delete("/groups/:groupId/remove/:userId", userAuth, removeUserFromGroup);
export default router;
