const express = require("express");
const router = express.Router();
const {
  refreshToken,
  checkUsernameAvailability,
  signInWithGoogle,
} = require("../controllers/auth/auth");

router.post("/check-username", checkUsernameAvailability);
router.post("/login", signInWithGoogle);
router.post("/refresh-token", refreshToken);

module.exports = router;
