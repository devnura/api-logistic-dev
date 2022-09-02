const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/project/project.controller");
const multer = require('../middleware/multer.middleware')

// ============================== USER ==============================

router.get(
  "/",
  auth.authenticateToken,
  controller.getAll
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
  controller.validate('create'),
  controller.create
);

router.put(
  "/:code",
  auth.authenticateToken,
  multer.uploadPDF,
  controller.validate('update'),
  controller.update
);

router.delete(
  "/:code",
  auth.authenticateToken,
  controller.delete
);

module.exports = router;
