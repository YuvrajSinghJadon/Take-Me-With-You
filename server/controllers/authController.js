import Users from "../models/userModel.js";
import Verification from "../models/emailVerification.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

//register user
export const register = async (req, res, next) => {
  console.log("Request Body:", req.body); // Add this log
  const {
    firstName,
    lastName,
    email,
    password,
    whatsappNumber,
    expoPushToken,
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !whatsappNumber) {
    return res.status(400).json({ message: "Provide Required Fields!" });
  }

  try {
    // Check if the user already exists
    const userExist = await Users.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email Address already exists" });
    }

    // Hash the password
    const hashedPassword = await hashString(password);

    // Generate a verification token (for email verification)
    const token = uuidv4(); // Generate a random token
    const hashedToken = await hashString(token); // Store the hashed token

    // Store the verification token in the database for this email
    await Verification.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      whatsappNumber,
      expoPushToken,
      token: hashedToken, // Store the hashed token
      joinRequests: [],
      groups: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour expiry for the token
    });

    // Send verification email
    try {
      await sendVerificationEmail({ email, token, lastName }, res);
      return res.status(201).json({
        success: true,
        message: "Registration successful. Please verify your email.",
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
};
// Login user
export const login = async (req, res, next) => {
  const { email, password, expoPushToken, platform } = req.body;
  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide user credentials" });
  }

  try {
    // Find user by email
    const user = await Users.findOne({ email }).select("+password").populate({
      path: "friends",
      select: "firstName lastName location profileUrl -password",
    });

    if (!user) {
      return next("Invalid email or password");
    }

    if (!user.verified) {
      return next("User email is not verified. Check your email and verify.");
    }

    // Compare password
    const isMatch = await compareString(password, user.password);

    if (!isMatch) {
      return next("Invalid email or password");
    }
    // Only update expoPushToken if it's a mobile platform and the token has changed
    if (
      platform === "mobile" &&
      expoPushToken &&
      user.expoPushToken !== expoPushToken
    ) {
      user.expoPushToken = expoPushToken;
      await user.save(); // Save the updated token if it's different
    }

    user.password = undefined; // Remove password before sending response

    const token = createJWT(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error: ", error); // Log the error to get more details
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  const { token } = req.params; // Get the token from the URL

  try {
    // Find the verification record
    const verificationRecord = await Verification.findOne({});

    if (!verificationRecord) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Check if token has expired
    if (verificationRecord.expiresAt < Date.now()) {
      // If the token has expired, delete the verification record
      await Verification.findByIdAndDelete(verificationRecord._id);
      return res
        .status(400)
        .json({ message: "Token has expired. Please register again." });
    }

    // Compare the token with the stored hashed token
    const isMatch = await bcrypt.compare(token, verificationRecord.token);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Create the user now that the email is verified
    const {
      firstName,
      lastName,
      email,
      password,
      whatsappNumber,
      joinRequests,
      groups,
      expoPushToken, // Ensure we are capturing the push token here
    } = verificationRecord;

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password, // Password is already hashed
      whatsappNumber,
      verified: true,
      expoPushToken, // Save the push token into the user's document
      joinRequests: [], // Initialize as an empty array
      groups: [],
    });

    // Delete the verification record after user creation
    await Verification.findByIdAndDelete(verificationRecord._id);

    // Send success response
    return res.redirect(`${process.env.APP_FRONTEND_URL}/verification-success`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};
