const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/auth/auth.controller");
const helper = require('../helpers/helper')
const {
  login_rules,
  refres_token_rules,
  validate
} = require('../modules/auth/auth.validator')

// ============================== AUTH ==============================
router.post("/login", login_rules(), validate, controller.loginUser);
router.post("/refresh-token", refres_token_rules(), validate, auth.authenticateRefreshToken,controller.refreshToken);
router.post("/logout", auth.authenticateToken, controller.logoutUser);

module.exports = router;
