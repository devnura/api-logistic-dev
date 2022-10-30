const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/user/user.controller");
const validator = require("../modules/project/project.validate");
const helper = require("../helpers/validateRequest")
// ============================== USER ==============================

router.get(
  "/list",
  auth.authenticateToken,
  helper.validate,
  controller.getUsersList
);

router.get(
  "/table",
  auth.authenticateToken,
  validator.rules('table'),
  helper.validate,
  controller.getUsersTable
);

router.get(
  "/:code",
  auth.authenticateToken,
  helper.validate,
  controller.getUser
);

router.post(
  "/",
  auth.authenticateToken,
  validator.rules('createUser'),
  helper.validate,
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
