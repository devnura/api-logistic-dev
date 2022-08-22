const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/auth/auth.controller");

// ============================== AUTH ==============================
router.post("/login", controller.validate('login'), controller.loginUser);
router.post("/refresh-token", controller.validate('refreshToken'), auth.authenticateRefreshToken, controller.refreshToken);
router.post("/logout", auth.authenticateToken, controller.logoutUser);

module.exports = router;
