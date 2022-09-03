const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/project/project.controller");
const multer = require('../middleware/multer.middleware')
const validator = require("../modules/project/project.validate");
// ============================== USER ==============================

router.get(
  "/list",
  auth.authenticateToken,
  validator.validate,
  controller.list
);

router.get(
  "/table",
  auth.authenticateToken,
  validator.rules('createe'),
  validator.validate,
  controller.table
);

router.get(
  "/:code",
  auth.authenticateToken,
  controller.find
);

router.post(
  "/",
  auth.authenticateToken,
  multer.uploadPDF,
  validator.rules('create'),
  validator.validate,
  controller.create
);

router.put(
  "/:code",
  auth.authenticateToken,
  multer.uploadPDF,
  validator.rules('update'),
  validator.validate,
  controller.update
);

router.put(
  "/onprogress/:code",
  auth.authenticateToken,
  controller.onProgres
);

router.put(
  "/complete/:code",
  auth.authenticateToken,
  controller.complete
);

router.delete(
  "/:code",
  auth.authenticateToken,
  controller.delete
);

module.exports = router;
