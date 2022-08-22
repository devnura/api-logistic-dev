const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/user/user.controller");


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
  controller.validate('createUser'),
  controller.insertUser
);

router.put(
  "/:code",
  auth.authenticateToken,
  controller.validate('updateUser'),
  controller.updateUser
);

router.put(
  "/reset-password/:code",
  auth.authenticateToken,
  controller.validate('resetPassword'),
  controller.resetPassword
);

router.delete(
  "/:code",
  auth.authenticateToken,
  controller.deleteUser
);

module.exports = router;
