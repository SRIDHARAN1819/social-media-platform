const User = require("../models/User");

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user", error });
  }
};

exports.setProfilePublic = async (req, res) => {
  try {
    // Get userId from the request body or params
    const userId = req.body.userId || req.params.userId;

    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.profileVisibility = "public";
    await user.save();

    res.status(200).json({ msg: "Profile visibility set to public" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error setting profile to public", error });
  }
};

exports.setProfilePrivate = async (req, res) => {
  try {
    // Get userId from the request body or params
    const userId = req.body.userId || req.params.userId;

    if (!userId) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.profileVisibility = "private";
    await user.save();

    res.status(200).json({ msg: "Profile visibility set to private" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error setting profile to private", error });
  }
};




