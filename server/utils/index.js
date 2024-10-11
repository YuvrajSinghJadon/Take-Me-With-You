//index.js
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

// Hash a string (e.g., password)
export const hashString = async (useValue) => {
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(useValue, salt);
  return hashedpassword;
};

// Compare a string (e.g., passwords)
export const compareString = async (password, userPassword) => {
  const isMatch = await bcrypt.compare(password, userPassword);
  return isMatch;
};

export const createJWT = (user) => {
  return JWT.sign(
    {
      userId: user._id, // Use user._id here to get the correct user ID from MongoDB
      userType: user.userType, // Attach userType directly
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1d" }
  );
};
