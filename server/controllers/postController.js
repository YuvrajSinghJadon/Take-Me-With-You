import Comments from "../models/commentModel.js";
import Group from "../models/Groups.js";
import User from "../models/userModel.js";
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
// Get all posts for a user, along with join requests
export const getUserPostsWithJoinRequests = async (req, res) => {
  try {
    const { id: userId } = req.params; // Get the userId from URL params
    const { userId: authUserId } = req.user; // Authenticated user (for checking ownership)

    // Step 1: Find all posts for the given user
    const posts = await Posts.find({ userId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .populate({
        path: "joinRequests", // Populate the joinRequests for each post
        populate: { path: "userId", select: "firstName lastName profileUrl" }, // Populate the user who made the join request
      })
      .sort({ _id: -1 });

    // Step 2: Ensure the posts exist
    if (!posts.length) {
      return res.status(200).json({
        success: true,
        message: "No posts found for this user",
        data: [],
      });
    }

    // Step 3: Ensure that the authenticated user is the owner of the posts
    if (userId !== authUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to join requests",
      });
    }

    // Step 4: Return the posts along with their join requests
    res.status(200).json({
      success: true,
      message: "User's posts and join requests fetched successfully",
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

    // Fetch the post by its ID
    const post = await Posts.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already sent a join request for this post
    const existingRequest = await JoinRequests.findOne({ postId: id, userId });

    if (existingRequest) {
      return res.status(200).json({
        success: false,
        message: "You have already sent a join request for this post.",
      });
    }

    // Create a new join request
    const joinRequest = await JoinRequests.create({
      postId: id,
      userId,
    });

    // Push the newly created join request into the post's joinRequests array
    post.joinRequests.push(joinRequest._id);
    await post.save(); // Save the updated post with the join request

    return res.status(201).json({
      success: true,
      message: "Join request sent successfully.",
      data: joinRequest,
    });
  } catch (error) {
    console.error("Error creating join request:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const acceptJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.user; // The user (post creator) accepting the request

    // Find the join request
    const joinRequest = await JoinRequests.findById(requestId);

    if (!joinRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Join request not found" });
    }

    // Find the post related to the join request
    const post = await Posts.findById(joinRequest.postId);

    if (!post || post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if a group exists for this specific post
    let group = await Group.findOne({ postId: post._id });

    // Log the post creator and post ID to ensure it's specific to the post
    console.log("Post creator:", post.userId);
    console.log("Post ID:", post._id); // Log to confirm the correct post is being handled

    // If no group exists for this post, create a new one
    if (!group) {
      group = new Group({
        groupName: `Group for ${post.description.slice(0, 11)}`, // Group name based on post title
        postId: post._id, // Associate the group with the specific post
        owner: post.userId.toString(), // Owner is the post creator
        users: [post.userId.toString(), joinRequest.userId.toString()], // Add post creator and accepted user
      });

      await group.save();
      console.log("Group created for post:", post._id);

      // Update users (creator and accepted user) to include this group in their groups array
      await User.findByIdAndUpdate(
        post.userId,
        {
          $push: { groups: group._id },
        },
        { new: true, upsert: true }
      );

      await User.findByIdAndUpdate(
        joinRequest.userId,
        {
          $push: { groups: group._id },
        },
        { new: true, upsert: true }
      );

      // Remove the join request after user is added to group
      await joinRequest.deleteOne();

      return res.status(201).json({
        success: true,
        message: "Group created and user added to the group for the post.",
        group,
      });
    }

    // Log group information to verify it's correct for this specific post
    console.log("Group found for post:", group.postId);

    // Check if the user is already in the group for this post
    const isUserInGroup = group.users.some(
      (user) => user.toString() === joinRequest.userId.toString()
    );

    if (isUserInGroup) {
      // If user is already in the group, just remove the join request and return a success response
      await joinRequest.deleteOne();
      return res.status(200).json({
        success: true,
        message:
          "User is already a member of the group for this post, join request removed.",
        group,
      });
    }

    // If group exists and user is not in the group, add the user
    group.users.push(joinRequest.userId.toString());
    await group.save();

    // Add group to the accepted user's group array
    await User.findByIdAndUpdate(
      joinRequest.userId,
      {
        $push: { groups: group._id },
      },
      { new: true, upsert: true }
    );

    // Now handle trip member addition to the post
    if (!post.tripMembers) {
      post.tripMembers = []; // Initialize tripMembers array if it doesn't exist
    }

    if (!post.tripMembers.includes(joinRequest.userId.toString())) {
      post.tripMembers.push(joinRequest.userId.toString());
      await post.save();
    }

    // Remove the join request since it has been approved
    await joinRequest.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User added to the existing group for this post.",
      group,
    });
  } catch (error) {
    console.error("Error accepting join request:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
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

// Get Group by Post ID
export const getGroupByPostId = async (req, res) => {
  try {
    const { postId } = req.params; // Get the post ID from the route parameters
    console.log("Fetching group for postId:", postId);

    // Find the group associated with the given post ID
    const group = await Group.findOne({ postId }).populate(
      "users",
      "firstName lastName"
    );

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
