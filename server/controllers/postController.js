import Comments from "../models/commentModel.js";
import Posts from "../models/PostModel.js";
import JoinRequests from "../models/joinRequests.js";
import { uploadOnCloudinary } from "../utils/uploadFiles.js";
import sendWhatsAppMessage from "../utils/smsService.js";
// Create a Posts
export const createPost = async (req, res) => {
  try {
    const { userId } = req.user; // Get the authenticated userId from the req object
    const { description, startDate, estimatedDays, destinations } = req.body;

    if (!description) {
      return res
        .status(400)
        .json({ message: "You must provide a description" });
    }

    let imageUrl = null;

    // Check if there's an image file and upload it to Cloudinary
    if (req.file) {
      console.log("File path to upload:", req.file.path);
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult) {
        imageUrl = uploadResult.url; // Store the uploaded image URL
      }
    }
    //They below code is to check if multer is working fine.
    // if (req.file) {
    //   console.log("File uploaded successfully via Multer:", req.file);
    //   res.status(201).json({
    //     success: true,
    //     message: "File uploaded",
    //     filePath: req.file.path,
    //   });
    // }

    // Create the post with the destinations array and optional image URL
    const post = await Posts.create({
      userId,
      description,
      startDate,
      estimatedDays,
      destinations: JSON.parse(destinations), // Parse the destinations array
      imageUrl, // Store the Cloudinary image URL if available
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get Posts for Homepage
export const getPosts = async (req, res) => {
  try {
    const { search } = req.body; // No need for userId

    // If there's a search query, filter posts based on the description
    const posts = await Posts.find(
      search ? { description: { $regex: search, $options: "i" } } : {}
    )
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 }); // Sort posts in descending order (most recent first)

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
    const { id } = req.params; // Extract post ID from URL params

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
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get User's Posts by userId
export const getUserPost = async (req, res) => {
  try {
    const { id: userId } = req.params; // Get the userId from URL params

    // Find all posts for this specific user
    const posts = await Posts.find({ userId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    if (!posts.length) {
      return res.status(200).json({
        success: true,
        message: "No posts found for this user",
        data: [],
      });
    }

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
    const { comment } = req.body; // Get the comment text from the request
    const { id } = req.params; // Post ID
    const { userId } = req.user; // Get the user ID from the token

    // Validate if the comment is provided
    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Create the new comment
    const newComment = await Comments.create({
      comment,
      userId,
      postId: id, // Attach the post ID to associate the comment with the post
    });

    // Update the post to include the new comment in its comments array
    const post = await Posts.findById(id);
    post.comments.push(newComment._id);
    await post.save();

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Reply to a Comment
export const replyPostComment = async (req, res) => {
  try {
    const { comment, replyAt, from } = req.body;
    const { userId } = req.user;
    const { id } = req.params; // Comment ID

    if (!comment) {
      return res.status(400).json({ message: "Reply content is required" });
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
      data: commentInfo.replies[commentInfo.replies.length - 1], // Send back the newly added reply
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
//Like or Unlike a comment
// Like or Unlike a Comment
export const likeComment = async (req, res) => {
  try {
    const { id } = req.params; // Comment ID
    const { userId } = req.user;

    const comment = await Comments.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user has already liked the comment
    if (comment.likes.includes(userId)) {
      // Unlike the comment
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== userId
      );
    } else {
      // Like the comment
      comment.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Like updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Like or Unlike a Reply
export const likeReply = async (req, res) => {
  try {
    const { id, replyId } = req.params; // Comment ID and Reply ID
    const { userId } = req.user;

    const comment = await Comments.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if user has already liked the reply
    if (reply.likes.includes(userId)) {
      // Unlike the reply
      reply.likes = reply.likes.filter((like) => like.toString() !== userId);
    } else {
      // Like the reply
      reply.likes.push(userId);
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Like updated successfully",
      data: reply,
    });
  } catch (error) {
    console.error("Error liking reply:", error);
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
    const { userId } = req.user; // Extract userId from the authenticated user
    const { id } = req.params; // Post ID

    // Fetch the post along with the owner's user details
    const post = await Posts.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Trip not found" });
    }
    // Log the owner details for debugging

    // Check if the user has already sent a join request
    const existingRequest = await JoinRequests.findOne({ postId: id, userId });
    if (existingRequest) {
      return res.status(200).json({
        success: false,
        message: "You have already sent a join request for this trip.",
      });
    }

    // Create a new join request if not already made
    const joinRequest = await JoinRequests.create({
      postId: id,
      userId,
    });

    // const owner = post.userId; // Populated with full user details (firstName, whatsappNumber)
    // if (owner && owner.whatsappNumber) {
    //   console.log("this is called");
    //   const messageContent = {
    //     to: `+91${owner.whatsappNumber}`, // Prepend +91 to the number
    //     message: `Hello ${owner.firstName}, a user has requested to join your trip: "${post.description}". Please review the request.`,
    //   };
    //   console.log("this is called before await");
    //   await sendWhatsAppMessage(messageContent); // Send the message using your service
    //   console.log("this is called after await");
    // } else {
    //   console.log("Owner WhatsApp number not found");
    // }

    res.status(201).json({
      success: true,
      message: "Join request sent successfully",
      data: joinRequest,
    });
  } catch (error) {
    console.log("Error creating join request:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Accept Join Request
export const acceptJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const joinRequest = await JoinRequests.findById(requestId).populate(
      "postId userId"
    );

    if (!joinRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Join request not found" });
    }

    const post = await Posts.findById(joinRequest.postId);
    if (!post || post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Initialize the tripMembers array if it doesn't exist
    if (!post.tripMembers) {
      post.tripMembers = [];
    }

    // Add the user to the tripMembers array
    post.tripMembers.push(joinRequest.userId);
    await post.save();

    // Use deleteOne to remove the join request since it's been approved
    await joinRequest.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User added to the trip",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Try again." });
  }
};

// Reject Join Request
export const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const joinRequest = await JoinRequests.findById(requestId).populate(
      "postId"
    );

    if (!joinRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Join request not found" });
    }

    const post = await Posts.findById(joinRequest.postId);
    if (!post || post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Use deleteOne to remove the join request
    await joinRequest.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Join request rejected",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Try again." });
  }
};

// Get all join requests for a specific trip
export const getJoinRequests = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { userId } = req.user; // Authenticated user

    // Debugging: Log userId from request and post owner userId
    console.log("Authenticated userId:", userId);
    const post = await Posts.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Trip not found" });
    }

    console.log("Post owner userId:", post.userId.toString());

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
