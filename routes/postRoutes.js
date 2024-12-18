const express = require("express");
const { commentPost,likePost,createPost, getPosts } = require("../controllers/postController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const postController = require('../controllers/postController');

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getPosts);
// Route to like a post
router.post("/like/:postId", authMiddleware, likePost);
// Route to comment on a post
router.post("/comment/:postId", authMiddleware, commentPost);


// Route to get posts by userId
router.get('/posts/:userId/:viewerId', postController.getPostsByUserId);

module.exports = router;
