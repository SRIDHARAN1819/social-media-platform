const Post = require("../models/Post");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Friendship = require("../models/Friendship");
module.exports = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      console.log("No token provided.");
      return res.status(401).json({ msg: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Log the decoded token for debugging

    // Attach the user information to the request object
    req.user = decoded;

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("JWT Verification Error:", error.message); // Log error details for debugging
    
    // Handle token-specific errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token. Please provide a valid token." });
    } else {
      return res.status(500).json({ msg: "Authentication error. Please try again." });
    }
  }
};
