import { verifyToken, extractTokenFromHeader } from "../Utils/jwt.utils.js";
import { User } from "../Models/index.js";

export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid or expired token",
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Token is invalid.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
          req.user = user;
          req.userId = decoded.id;
        }
      } catch (error) {
        console.log("Optional auth failed:", error.message);
      }
    }
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

