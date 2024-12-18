const express = require("express");
const { setProfilePublic, setProfilePrivate, getUser } = require("../controllers/userController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getUser);
// Route to set profile visibility to public
router.post("/profile/public/:userId", authMiddleware, setProfilePublic);

// Route to set profile visibility to private
router.post("/profile/private/:userId", authMiddleware, setProfilePrivate)
module.exports = router;
