const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/auth/auth.controller");
const validator = require("../modules/auth/auth.validate");
const helper = require("../helpers/validateRequest")
// ============================== AUTH ==============================
router.post(
    "/login",
    validator.rules('login'),
    helper.validate,
    controller.loginUser
);

router.post(
    "/refresh-token",
    validator.rules('refreshToken'),
    helper.validate,
    auth.authenticateRefreshToken,
    controller.refreshToken
);

router.post(
    "/logout",
    auth.authenticateToken,
    controller.logoutUser
);

module.exports = router;