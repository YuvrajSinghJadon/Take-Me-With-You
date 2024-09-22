import express from "express";
import userAuth from "../middleware/authMiddleware.js";
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
} from "../controllers/postController.js";

const router = express.Router();

// Create a post
router.post("/create-post", userAuth, createPost);

// Get all posts
router.post("/", userAuth, getPosts);

// Get a single post by ID
router.post("/:id", userAuth, getPost);

// Get all posts by a specific user
router.get("/get-user-post/:id", getUserPost); // Changed from POST to GET

// Get comments for a post
router.get("/comments/:postId", userAuth, getComments);

// Add a comment to a post
router.post("/comment/:id", userAuth, commentPost);

// Reply to a comment
router.post("/reply-comment/:id", userAuth, replyPostComment);

// Delete a post
router.delete("/:id", userAuth, deletePost);

// Create a join trip request
router.post("/join-request/:id", userAuth, createJoinRequest);

// Get all join requests for a specific trip
router.get("/join-requests/:id", userAuth, getJoinRequests);

export default router;
