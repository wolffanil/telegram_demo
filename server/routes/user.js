const express = require("express");
const {
  searchUsersByNameOrUsername,
  getFriendsList,
} = require("../controllers/auth/user");

const router = express.Router();

router.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

router.get("/search/:query", searchUsersByNameOrUsername);
router.get("/connected", getFriendsList);

module.exports = router;
