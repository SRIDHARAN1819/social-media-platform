const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const friendshipRoutes = require("./routes/friendshipRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
      msg: "SRIDHARAN_S && sridharan4999@gmail.com && 8838421923",
     "task": [
    "Task: Develop a Social Media Platform",
    "Objective: Create a social media platform inspired by Facebook’s functionality using Node.js, Express, and either MongoDB or PostgreSQL.",
    "Key Features:",
    "1. User Registration: Allow users to register and create profiles on the platform.",
    "2. Follow System: Implement the capability for users to follow or unfollow other registered users.",
    "3. Posting & Interactions: Users should be able to create posts with accompanying images. Other users must have the ability to comment on and like these posts.",
    "4. Friendship Mechanism: Enable users to establish friendships by sending and accepting friend requests.",
    "5. Profile Visibility: Implement two visibility settings: ‘public’ and ‘private’. If a user sets their profile to ‘public’, all followers should be able to view their posts. If set to ‘private’, only friends should have access to view their posts."
  ]
    });
  });
  
  

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendshipRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>  console.log(`The server is running at http://localhost:${PORT}`));
