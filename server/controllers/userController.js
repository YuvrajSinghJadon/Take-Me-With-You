import cloudinary from "cloudinary";
import { uploadOnCloudinary } from "../utils/uploadFiles.js"; // Assume we have this utility
import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import PasswordReset from "../models/PasswordReset.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";

export const requestPasswordReset = async (req, res) => {
  try {
    console.log("adsfasdf");
    const { email } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest && existingRequest.expiresAt > Date.now()) {
      return res.status(201).json({
        status: "PENDING",
        message: "Reset password link has already been sent to your email.",
      });
    }

    // Delete existing request if expired
    await PasswordReset.findOneAndDelete({ email });

    // Send reset password link
    await resetPasswordLink(user, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid password reset link." });
    }

    const resetPasswordRequest = await PasswordReset.findOne({ userId });
    if (!resetPasswordRequest) {
      return res.status(400).json({ message: "Invalid or expired link." });
    }

    const { expiresAt, token: hashedToken } = resetPasswordRequest;
    if (expiresAt < Date.now()) {
      return res.status(400).json({ message: "Password reset link expired." });
    }

    const isTokenValid = await compareString(token, hashedToken);
    if (!isTokenValid) {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    // If the token is valid, redirect to the SetNewPassword page
    return res.redirect(
      `${process.env.APP_FRONTEND_URL}/reset-password/${userId}/${token}`
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res
        .status(400)
        .json({ message: "User ID and password required." });
    }

    // Hash the new password
    const hashedPassword = await hashString(password);

    // Update the user's password
    const user = await Users.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      // Delete the password reset request after successful password update
      await PasswordReset.findOneAndDelete({ userId });

      res.status(200).json({
        success: true,
        message: "Password updated successfully.",
      });
    } else {
      res.status(400).json({ message: "User not found." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Controller to get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Assuming you have a User model
    const user = await Users.findById(id).select("-password"); // Exclude the password field

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  const { userId } = req.user; // Authenticated user ID
  const { firstName, lastName, profession, location } = req.body;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile picture upload if file is provided
    let profileUrl = user.profileUrl;
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult) {
        profileUrl = uploadResult.url;
      }
    }

    // Update user details
    user.firstName = firstName;
    user.lastName = lastName;
    user.profession = profession;
    user.location = location;
    user.profileUrl = profileUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Get User's Friends
export const getUserFriends = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const user = await Users.findById(userId).populate({
      path: "friends",
      select: "firstName lastName profileUrl profession",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      friends: user.friends,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error. Please try again.",
    });
  }
};
export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;

    const { requestTo } = req.body;

    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    if (requestExist) {
      next("Friend Request already sent.");
      return;
    }

    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (accountExist) {
      next("Friend Request already sent.");
      return;
    }

    const newRes = await FriendRequest.create({
      requestTo,
      requestFrom: userId,
    });

    res.status(201).json({
      success: true,
      message: "Friend Request sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};
// Controller to get all groups for a user
export const getUserGroups = async (req, res) => {
  console.log("Fetching groups for user:", req.user.userId); // Debug log
  try {
    // Get the user's ID from the authenticated request
    const userId = req.user.userId;

    const user = await Users.findById(userId).populate({
      path: "groups",
      populate: [
        { path: "postId", select: "postName" }, // Populating postId with postName
        { path: "owner", select: "firstName lastName" }, // Populating owner with first and last name
        { path: "users", select: "firstName lastName" }, // Populating users array with first and last name
      ],
    });

    // Check if user is not found
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Return the populated groups for the user
    res.status(200).json({
      success: true,
      data: user.groups, // Here we directly access `user.groups`
    });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);

    if (!requestExist) {
      next("No Friend Request Found.");
      return;
    }

    const newRes = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status }
    );

    if (status === "Accepted") {
      const user = await Users.findById(id);

      user.friends.push(newRes?.requestFrom);

      await user.save();

      const friend = await Users.findById(newRes?.requestFrom);

      friend.friends.push(newRes?.requestTo);

      await friend.save();
    }

    res.status(201).json({
      success: true,
      message: "Friend Request " + status,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const profileViews = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.body;

    const user = await Users.findById(id);

    user.views.push(userId);

    await user.save();

    res.status(201).json({
      success: true,
      message: "Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const suggestedFriends = async (req, res) => {
  try {
    const { userId } = req.body.user;

    let queryObject = {};

    queryObject._id = { $ne: userId };

    queryObject.friends = { $nin: userId };

    let queryResult = Users.find(queryObject)
      .limit(15)
      .select("firstName lastName profileUrl profession -password");

    const suggestedFriends = await queryResult;

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
