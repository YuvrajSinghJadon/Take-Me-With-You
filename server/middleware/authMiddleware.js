// authMiddleware.js
import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token or invalid token header");
    return res.status(401).json({
      success: false,
      message: "Authentication failed: Token missing or invalid.",
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token from the header

  try {
    console.log("Verifying token...");
    const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY); // Verify the token
    // Attach both userId and userType (role) to req.user
    req.user = { userId: userToken.userId, userType: userToken.userType };

    console.log("Token verified, proceeding to next middleware...");
    console.log("User details:", req.user); // Log the user details to debug
    next(); // Move to the next middleware/controller
  } catch (error) {
    console.log("JWT verification error:", error);
    return res.status(403).json({
      success: false,
      message: "Authentication failed: Invalid token.",
    });
  }
};

export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    // Convert both userType and allowedRoles to lowercase for consistency
    const userRole = req.user.userType.toLowerCase();
    console.log("User Type:", userRole); // Log the userType for debugging
    console.log(
      "Allowed Roles:",
      allowedRoles.map((role) => role.toLowerCase())
    ); // Log allowed roles

    // Ensure the user has one of the allowed roles
    if (!allowedRoles.map((role) => role.toLowerCase()).includes(userRole)) {
      console.log("Authorization failed: Access denied.");
      return res.status(403).json({
        success: false,
        message: "Authorization failed: Access denied.",
      });
    }
    next(); // User is authorized, proceed to the next middleware/controller
  };
};

export default userAuth;
