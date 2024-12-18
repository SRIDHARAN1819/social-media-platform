const Friendship = require("../models/Friendship");
const Follow = require("../models/Follow");
const User = require("../models/User");

exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.body;
  const requester = req.user; // Logged-in user (populated by middleware)

  console.log("Sending friend request...");
  console.log("Recipient ID:", recipientId);
  console.log("Requester (Logged-in User):", requester);

  try {
    // Check if the user exists
    const targetUser = await User.findById(recipientId);
    if (!targetUser) {
      console.log("User not found.");
      return res.status(404).json({ msg: "User not found." });
    }

    console.log("Target user found:", targetUser);

    // Allow request only for private accounts
    if (targetUser.profileVisibility !== "private") {
      console.log("Profile is not private. Cannot send friend request.");
      return res
        .status(400)
        .json({ msg: "Friend requests are only for private accounts." });
    }

    // Check if a request already exists
    const existingRequest = await Friendship.findOne({
      requester: requester.userId,  // Change this line to use userId
      recipient: recipientId,
      status: "pending",
    });
    if (existingRequest) {
      console.log("Friend request already sent.");
      return res.status(400).json({ msg: "Friend request already sent." });
    }

    // Check if requester and recipient are valid objects
    if (!requester.userId || !recipientId) {
      console.log("Invalid requester or recipient.");
      return res.status(400).json({ msg: "Invalid requester or recipient." });
    }

    console.log("Creating new friend request...");
    // Create a new friend request
    const newFriendship = new Friendship({
      requester: requester.userId,  // Change this line to use userId
      recipient: recipientId,
      status: "pending",
    });
    await newFriendship.save();

    console.log("Friend request sent successfully:", newFriendship);

    res.status(201).json({
      msg: "Friend request sent.",
      friendship: newFriendship,
      user: requester.userId, // Include the userId here as well
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ msg: "Error sending friend request.", error });
  }
};





exports.acceptFriendRequest = async (req, res) => {
  const { friendshipId } = req.body;

  console.log("Accepting friend request...");
  console.log("Friendship ID:", friendshipId);
  console.log("Logged-in User:", req.user);

  try {
    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) {
      console.log("Friend request not found.");
      return res.status(404).json({ msg: "Friend request not found." });
    }

    console.log("Friendship found:", friendship);

    // Ensure the logged-in user is either the requester or recipient
    if (
      friendship.recipient.toString() !== req.user.userId.toString() &&  // Change _id to userId
      friendship.requester.toString() !== req.user.userId.toString()      // Change _id to userId
    ) {
      console.log("User not authorized to accept this request.");
      return res.status(403).json({ msg: "You are not authorized to accept this request." });
    }

    console.log("User authorized to accept request.");
    // Update status to accepted
    friendship.status = "accepted";
    await friendship.save();

    console.log("Friend request accepted:", friendship);

    // Respond with the acceptance message and include the user ID of the logged-in user
    res.status(200).json({
      msg: "Friend request accepted.",
      friendship,
      userId: req.user.userId // Include the logged-in user ID in the response
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ msg: "Error accepting friend request.", error });
  }
};


























/*
// Send a friend request (Private account only)
exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.body;
  const requester = req.user;

  try {
    // Check if the user exists
    const targetUser = await User.findById(recipientId);
    if (!targetUser) return res.status(404).json({ msg: "User not found." });

    // Allow request only for private accounts
    if (targetUser.profileVisibility !== "private") {
      return res
        .status(400)
        .json({ msg: "Friend requests are only for private accounts." });
    }

    // Check if a request already exists
    const existingRequest = await Friendship.findOne({
      requester: requester._id,
      recipient: recipientId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ msg: "Friend request already sent." });
    }

    // Create a new friend request
    const newFriendship = new Friendship({
      requester: requester._id,
      recipient: recipientId,
      status: "pending",
    });
    await newFriendship.save();

    res.status(201).json({ msg: "Friend request sent.", friendship: newFriendship });
  } catch (error) {
    res.status(500).json({ msg: "Error sending friend request.", error });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  const { friendshipId } = req.body;

  try {
    const friendship = await Friendship.findById(friendshipId);
    if (!friendship) return res.status(404).json({ msg: "Friend request not found." });

    // Update status to accepted
    friendship.status = "accepted";
    await friendship.save();

    res.status(200).json({ msg: "Friend request accepted.", friendship });
  } catch (error) {
    res.status(500).json({ msg: "Error accepting friend request.", error });
  }
};
*/
// Follow user (handles public and private account logic)
exports.followUser = async (req, res) => {
  const { followId } = req.params;  // User to follow
  const follower = req.user;  // Extracting follower (user who is following)

  console.log("Follower:", follower);  // Log follower information
  console.log("Target User ID to Follow:", followId);  // Log target user ID

  try {
    const targetUser = await User.findById(followId);
    if (!targetUser) {
      console.log("Target user not found.");  // Log if target user is not found
      return res.status(404).json({ msg: "User not found." });
    }

    console.log("Target User:", targetUser);  // Log target user info

    // Check for private account logic
    if (targetUser.profileVisibility === "private") {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: follower._id, recipient: followId, status: "accepted" },
          { requester: followId, recipient: follower._id, status: "accepted" }
        ]
      });

      if (!friendship) {
        console.log("No friendship found, cannot follow private account.");  // Log if no friendship exists
        return res.status(403).json({
          msg: "Cannot follow a private account without an accepted friend request.",
        });
      }

      console.log("Friendship found:", friendship);  // Log friendship information if available
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: follower._id,
      following: followId,
    });

    if (existingFollow) {
      console.log("Already following this user.");  // Log if already following
      return res.status(400).json({ msg: "You are already following this user." });
    }

    console.log("Creating follow relationship...");  // Log before creating the follow relationship

    // Create follow relationship
    const follow = new Follow({
      follower: follower._id,  // Storing follower's user ID
      following: followId,
      userId: follower._id  // Add the userId in the follow record
    });

    await follow.save();

    console.log("Follow relationship created:", follow);  // Log created follow object

    // Respond with the follow information and the follower's user ID
    res.status(201).json({
      msg: "Follow successful.",
      follow,
      userId: follower._id  // Returning userId in the response
    });
  } catch (error) {
    console.log("Error during follow operation:", error);  // Log any errors
    res.status(500).json({ msg: "Error following user.", error });
  }
};


// Unfollow user
exports.unfollowUser = async (req, res) => {
  const { followId } = req.params; // User to unfollow
  const follower = req.user;

  try {
    const follow = await Follow.findOne({
      follower: follower._id,
      following: followId,
    });

    if (!follow) {
      return res.status(404).json({ msg: "You are not following this user." });
    }

    // Delete the follow relationship
    await Follow.deleteOne({ _id: follow._id });

    res.status(200).json({ msg: "Unfollow successful." });
  } catch (error) {
    res.status(500).json({ msg: "Error unfollowing user.", error });
  }
};


