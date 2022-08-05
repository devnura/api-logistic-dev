const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/user/user.controller");
const helper = require('../helpers/helper')

const {
  create_rules,
  update_rules,
  change_password_rules,
  validate
} = require('../modules/user/user.validator')

// ============================== USER ==============================

router.get(
  "/",
  auth.authenticateToken,
  controller.getUsers
);
router.get(
  "/:code",
  auth.authenticateToken,
  controller.getUser
);

router.post(
  "/",
  auth.authenticateToken,
  create_rules(),
  validate,
  controller.insertUser
);

// router.post(
//   "/refresh-token",
//   auth.authenticateRefreshToken,
//   // controller.validate("refreshToken"),
//   controller.refreshToken
// );


module.exports = router;
