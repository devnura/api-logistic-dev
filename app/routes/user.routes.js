const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/auth/auth.controller");

const {
  login_rules,
  validate
} = require('../modules/auth/auth.validator')

// ============================== AUTH ==============================
router.post(
  "/login",
  login_rules(),
  validate,
  controller.loginUser
);

router.post(
  "/refresh-token",
  auth.authenticateRefreshToken,
  // controller.validate("refreshToken"),
  controller.refreshToken
);


module.exports = router;
