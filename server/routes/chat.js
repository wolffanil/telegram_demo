const express = require("express");
const {
  getUserConversations,
  getPaginatedChats,
} = require("../controllers/chat");
const authMiddleware = require("../middleware/authentication");
const router = express.Router();

router.get("/", authMiddleware, getUserConversations);
router.get("/paginated-chats", authMiddleware, getPaginatedChats);

module.exports = router;
