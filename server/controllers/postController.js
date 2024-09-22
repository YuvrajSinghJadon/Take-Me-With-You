import Comments from "../models/commentModel.js";
import Posts from "../models/postModel.js";
import JoinRequests from "../models/joinRequests.js";
import mongoose from "mongoose";
// Create a Post
export const createPost = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { description, startDate, estimatedDays, destinations } = req.body;

    if (!description) {
      return res
        .status(400)
        .json({ message: "You must provide a description" });
    }

    // Create the post with the destinations array
    const post = await Posts.create({
      userId,
      description,
      startDate,
      estimatedDays,
      destinations, // Array of destinations is directly stored
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get Posts
export const getPosts = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

    const posts = await Posts.find(
      search ? { description: { $regex: search, $options: "i" } } : {}
    )
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get a single post by ID
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Posts.findById(id).populate({
      path: "userId",
      select: "firstName lastName location profileUrl -password",
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get User's Posts by userId
export const getUserPost = async (req, res) => {
  try {
    const { id: userId } = req.params; // Correctly fetch userId from params

    // Fetch posts where userId matches the passed userId
    const posts = await Posts.find({ userId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    // Return response, even if no posts are found
    if (!posts.length) {
      return res.status(200).json({
        success: true,
        message: "No posts found for this user",
        data: [],
      });
    }

    // Return fetched posts
    res.status(200).json({
      success: true,
      message: "User's posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get Comments on a Post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comments.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Comment on a Post
export const commentPost = async (req, res) => {
  try {
    const { comment, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const newComment = await Comments.create({
      comment,
      from,
      userId,
      postId: id,
    });

    const post = await Posts.findById(id);
    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Reply to a Comment
export const replyPostComment = async (req, res) => {
  try {
    const { comment, replyAt, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const commentInfo = await Comments.findById(id);
    if (!commentInfo) {
      return res.status(404).json({ message: "Comment not found" });
    }

    commentInfo.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });

    await commentInfo.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: commentInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Delete a Post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Posts.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Create Join Request for a trip
export const createJoinRequest = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params; // Post ID

    const post = await Posts.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const existingRequest = await JoinRequests.findOne({ postId: id, userId });
    if (existingRequest) {
      return res.status(400).json({ message: "Join request already sent." });
    }

    const joinRequest = await JoinRequests.create({
      postId: id,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Join request sent successfully",
      data: joinRequest,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get all join requests for a specific trip
export const getJoinRequests = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { userId } = req.body.user;

    const post = await Posts.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const joinRequests = await JoinRequests.find({ postId: id }).populate(
      "userId",
      "firstName lastName profileUrl"
    );

    res.status(200).json({
      success: true,
      message: "Join requests fetched successfully",
      data: joinRequests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
