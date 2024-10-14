import Comments from "../models/commentModel.js";
import Group from "../models/Groups.js";
import Users from "../models/userModel.js";
import Posts from "../models/PostModel.js";
import JoinRequests from "../models/joinRequests.js";
import { uploadOnCloudinary } from "../utils/uploadFiles.js";
import sendWhatsAppMessage from "../utils/smsService.js";
import { emitPostCreated } from "../webSockets/postSocket.js";
import sendPushNotification from "../utils/sendPushNotification.js";
// Create a Posts
export const createPost = async (req, res) => {
  try {
    console.log("create post api hit");
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
        console.log("url image: ", imageUrl);
      }
    }
    // Create the post with the destinations array and optional image URL
    const post = await Posts.create({
      userId,
      description,
      startDate,
      estimatedDays,
      destinations: JSON.parse(destinations), // Parse the destinations array
      imageUrl, // Store the Cloudinary image URL if available
    });
    // Populate user data before emitting
    const populatedPost = await Posts.findById(post._id).populate(
      "userId",
      "firstName lastName avatar"
    );

    emitPostCreated(populatedPost);

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
    const { search, page = 1, limit = 10 } = req.query; // Default page is 1, limit is 10 posts per page
    const skip = (page - 1) * limit;

    // If there's a search query, filter posts based on the description
    const posts = await Posts.find(
      search ? { description: { $regex: search, $options: "i" } } : {}
    )
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl ",
      })
      .sort({ _id: -1 }) // Sort posts in descending order (most recent first)
      .skip(skip) // Skip the previous pages' posts
      .limit(Number(limit)); // Limit the number of posts fetched
    const totalPosts = await Posts.countDocuments(
      search ? { description: { $regex: search, $options: "i" } } : {}
    );

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: posts,
      totalPosts, // Include total post count for the client to calculate if more data exists
    });
  } catch (error) {
    console.error("Error creating post:", error.stack); // Log the full error stack
    res.status(500).json({
      message: "Server error. Please try again.",
      error: error.message,
    }); // Send back error message for easier debugging
  }
};

// Get a single post by ID
export const getPost = async (req, res) => {
  try {
    const { id } = req.params; // Extract post ID from URL params

    const post = await Posts.findById(id).populate({
      path: "userId",
      select: "firstName lastName location profileUrl ",
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
        select: "firstName lastName location profileUrl ",
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
        select: "firstName lastName location profileUrl ",
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
        select: "firstName lastName location profileUrl ",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl ",
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
    const post = await Posts.findById(id).populate(
      "userId",
      "expoPushToken firstName"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already sent a join request for this post
    const user = await Users.findById(userId);
    const existingRequest = user.joinRequests.find(
      (request) => request.postId.toString() === id
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You have already made a join request for this post.",
      });
    }

    // Create a new join request
    const joinRequest = await JoinRequests.create({
      postId: id,
      userId,
      status: "Pending",
    });

    // Add the join request to the user's joinRequests array
    await Users.findByIdAndUpdate(
      userId,
      {
        $push: {
          joinRequests: { postId: id, status: "Pending" },
        },
      },
      { new: true, upsert: true }
    );

    // Push the newly created join request into the post's joinRequests array
    post.joinRequests.push(joinRequest._id);
    await post.save(); // Save the updated post with the join request

    // Fetch the post owner's push token and send a notification
    const postOwner = post.userId; // Assuming userId refers to the post owner
    if (postOwner && postOwner.expoPushToken) {
      await sendPushNotification(
        postOwner.expoPushToken,
        "New Join Request",
        `${user.firstName} has requested to join your trip!`
      );
    }

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

// Accept Join Request
export const acceptJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.user; // Post creator

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

    // If no group exists, create a new one
    if (!group) {
      group = new Group({
        groupName: `Group for ${post.description.slice(0, 11)}`, // Group name based on post description
        postId: post._id, // Associate the group with the post
        owner: post.userId.toString(), // Owner is the post creator
        users: [post.userId.toString(), joinRequest.userId.toString()], // Add post creator and accepted user
      });

      await group.save();

      // Update the user’s groups array (post owner)
      await Users.findByIdAndUpdate(
        post.userId,
        { $push: { groups: group._id } },
        { new: true, upsert: true }
      );

      // Update the accepted user's groups array
      await Users.findByIdAndUpdate(
        joinRequest.userId,
        { $push: { groups: group._id } },
        { new: true, upsert: true }
      );
    } else {
      // If the group already exists, add the user if not already a member
      if (!group.users.includes(joinRequest.userId.toString())) {
        group.users.push(joinRequest.userId.toString());
        await group.save();
      }
      // FIX: Update the accepted user's groups array if the group already exists
      await Users.findByIdAndUpdate(
        joinRequest.userId,
        { $push: { groups: group._id } }, // Push the group ID into the user's groups array
        { new: true, upsert: true }
      );
    }

    // Add the user to the trip members of the post (if not already added)
    if (!post.tripMembers.includes(joinRequest.userId.toString())) {
      post.tripMembers.push(joinRequest.userId.toString());
      await post.save();
    }

    // Update the status of the join request to "Approved" in the User's joinRequests array
    await Users.updateOne(
      { _id: joinRequest.userId, "joinRequests.postId": joinRequest.postId },
      { $set: { "joinRequests.$.status": "Accepted" } }
    );

    // Remove the join request from the JoinRequests schema
    await joinRequest.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Join request approved, and user added to the group.",
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

    // Find the join request
    const joinRequest = await JoinRequests.findById(requestId).populate(
      "postId"
    );
    if (!joinRequest) {
      return res.status(404).json({ message: "Join request not found" });
    }

    const post = await Posts.findById(joinRequest.postId);
    if (!post || post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the status in the user's joinRequests array to "Rejected"
    await Users.updateOne(
      { _id: joinRequest.userId, "joinRequests.postId": joinRequest.postId },
      { $set: { "joinRequests.$.status": "Rejected" } }
    );

    // Remove the join request from the JoinRequests schema
    await joinRequest.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Join request rejected.",
    });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
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

// Remove a user from the group (admin action)
export const removeUserFromGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { userId: adminId } = req.user; // Group owner/admin

    // Find the group and ensure the request is coming from the group owner
    const group = await Group.findById(groupId);
    if (!group || group.owner.toString() !== adminId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // Remove the user from the group
    await Group.findByIdAndUpdate(groupId, {
      $pull: { users: userId },
    });

    return res.status(200).json({ message: "User removed from group" });
  } catch (error) {
    console.error("Error removing user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
