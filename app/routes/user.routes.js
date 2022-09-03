const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/user/user.controller");
const validator = require("../modules/project/project.validate");

// ============================== USER ==============================

router.get(
  "/list",
  auth.authenticateToken,
  validator.validate,
  controller.getUsersList
);

router.get(
  "/table",
  auth.authenticateToken,
  validator.rules('table'),
  validator.validate,
  controller.getUsersTable
);

router.get(
  "/:code",
  auth.authenticateToken,
  validator.validate,
  controller.getUser
);

router.post(
  "/",
  auth.authenticateToken,
  validator.rules('createUser'),
  validator.validate,
  controller.insertUser
);

router.put(
  "/:code",
  auth.authenticateToken,
  validator.rules('updateUser'),
  validator.validate,
  controller.updateUser
);

router.put(
  "/reset-password/:code",
  auth.authenticateToken,
  validator.rules('resetPassword'),
  validator.validate,
  controller.resetPassword
);

router.delete(
  "/:code",
  auth.authenticateToken,
  validator.validate,
  controller.deleteUser
);

module.exports = router;
