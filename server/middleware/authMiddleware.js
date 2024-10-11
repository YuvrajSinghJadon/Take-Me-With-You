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
    // Ensure the user is authenticated and has the correct role
    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "Authorization failed: Access denied.",
      });
    }
    next(); // User is authorized, proceed to the next middleware/controller
  };
};

export default userAuth;
