const mongoose = require("mongoose");

const FriendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
});

module.exports = mongoose.model("Friendship", FriendshipSchema);