const express = require("express");
const {
  sendFriendRequest,
  acceptFriendRequest,
  followUser,
  unfollowUser
} = require("../controllers/friendshipController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");



router.post("/request", authMiddleware, sendFriendRequest); // For private accounts
router.post("/accept", authMiddleware, acceptFriendRequest); // Accept friend request
router.post("/follow/:followId", authMiddleware, followUser); // Follow for both private and public accounts
router.post("/unfollow/:followId", authMiddleware, unfollowUser); // Unfollow



module.exports = router;
