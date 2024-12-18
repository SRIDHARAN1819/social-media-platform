const Post = require("../models/Post");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const Follow = require("../models/Follow");
const Friendship = require("../models/Friendship");

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Filename format
  }
});

const upload = multer({ storage: storage });

// Create post with image upload
exports.createPost = [
  upload.single("image"), // Multer middleware for handling the image upload
  async (req, res) => {
    const { content, userId } = req.body; // Accept userId and content from the form data

    // Trim any leading/trailing spaces from userId
    const trimmedUserId = userId.trim();

    if (!content) {
      return res.status(400).json({ msg: "Content is required." });
    }

    // Check if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(trimmedUserId)) {
      return res.status(400).json({ msg: "Invalid user ID format." });
    }

    // Find the user by userId
    const user = await User.findById(trimmedUserId);  

    if (!user) {
      return res.status(400).json({ msg: "User not found." });
    }

    // Get the uploaded image file path if exists
    const image = req.file ? req.file.path : null;
    console.log("Uploaded Image Path:", image);

    try {
      // Create the post with the user._id from the manually passed userId
      const newPost = new Post({
        user: user._id,   // Use the userId from request body
        content,
        image,
      });

      await newPost.save();
      console.log("Post saved to database.");

      const populatedPost = await Post.findById(newPost._id).populate('user', 'username email');
      res.status(201).json(populatedPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ msg: "Error creating post", error });
    }
  }
];




// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching posts", error });
  }
};



/*
exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ msg: "You have already liked this post" });
    }

    // Add the user to the likes array
    post.likes.push(userId);
    await post.save();

    res.status(200).json({ msg: "Post liked successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error", error });
  }
};
*/ 
exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body || req.user?._id; // Extract user ID from body or req.user

  try {
    // Log userId for debugging
    console.log("User ID liking the post:", userId);

    if (!userId) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ msg: "You have already liked this post" });
    }

    // Add the user to the likes array
    post.likes.push(userId); // Push userId into likes array
    await post.save();

    res.status(200).json({ msg: "Post liked successfully", post });
  } catch (error) {
    console.error("Error in likePost:", error); // Log detailed error
    res.status(500).json({ msg: "Server error", error });
  }
};




exports.commentPost = async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const userId = req.user._id;

  try {
    // Validate input
    if (!comment) {
      return res.status(400).json({ msg: "Comment content is required" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Create the comment
    const newComment = new Comment({
      post: postId,
      user: userId,
      comment,
    });

    // Save the comment
    await newComment.save();

    // Push the comment ID to the Post's comments array
    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json({ msg: "Comment added successfully", newComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error adding comment", error });
  }
};






// Function to get posts based on profile visibility
exports.getPostsByUserId = async (req, res) => {
  try {
    const { userId, viewerId } = req.params;  // userId is the profile user, viewerId is the one requesting posts

    console.log(`Fetching posts for userId: ${userId} requested by viewerId: ${viewerId}`);

    // Fetch user details by userId
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with id ${userId} not found`);
      return res.status(404).json({ msg: "User not found" });
    }

    console.log(`User found: ${user.username}, profileVisibility: ${user.profileVisibility}`);

    // Fetch posts of the user
    let posts;

    if (user.profileVisibility === "public") {
      console.log(`Profile is public. Fetching posts for ${user.username}...`);
      // If profile is public, all followers can view posts
      posts = await Post.find({ user: userId })
        .populate('user', 'username email')  // Populate user details in posts
        .populate('likes', 'username')
        .populate('comments', 'comment user')
        .exec();
    } else {
      console.log(`Profile is private. Checking friendship status...`);
      // If profile is private, only friends can view posts
      const friendship = await Friendship.findOne({
        $or: [
          { requester: userId, recipient: viewerId, status: "accepted" },
          { requester: viewerId, recipient: userId, status: "accepted" },
        ],
      });

      if (!friendship) {
        console.log(`No friendship found between user ${userId} and viewer ${viewerId}`);
        return res.status(403).json({ msg: "You are not friends with this user" });
      }

      console.log(`Friendship found. Fetching posts for ${user.username}...`);
      // If friends, fetch posts
      posts = await Post.find({ user: userId })
        .populate('user', 'username email')
        .populate('likes', 'username')
        .populate('comments', 'comment user')
        .exec();
    }

    // Return the fetched posts
    console.log(`Fetched ${posts.length} posts for user ${user.username}`);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ msg: "Server error", error });
  }
};
