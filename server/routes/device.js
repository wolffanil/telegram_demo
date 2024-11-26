const express = require("express");

const authMiddleware = require("../middleware/authentication");
const { registerDeviceToken, removeDeviceToken } = require("../controllers/deviceTokens");

const router = express.Router();

router.post("/register", authMiddleware, registerDeviceToken);
router.post("/remove", authMiddleware, removeDeviceToken);

module.exports = router;
