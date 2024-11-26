const express = require("express");
const {
  sendFriendRequest,
  handleFriendRequest,
  listFriendRequests,
  unfriend,
} = require("../controllers/friendRequests");

const router = express.Router();

router.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

router.post("/send", sendFriendRequest);
router.post("/handle", handleFriendRequest);
router.get("/list", listFriendRequests);
router.post("/unfriend", unfriend);

module.exports = router;
