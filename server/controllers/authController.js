import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate fields
  if (!firstName || !lastName || !email || !password) {
    return next("Provide Required Fields!");
  }

  try {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      return next("Email Address already exists");
    }

    const hashedPassword = await hashString(password);

    const user = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Send email verification to user
    await sendVerificationEmail(user, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

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
