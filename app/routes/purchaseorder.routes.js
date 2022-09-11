const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/purchaseOrder/purchaseOrder.controller");
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
  validator.rules('table'),
  validator.validate,
  controller.table
);

// router.get(
//   "/projectManager",
//   auth.authenticateToken,
//   validator.validate,
//   controller.getProejctManager
// );

// router.get(
//   "/:code",
//   auth.authenticateToken,
//   validator.validate,
//   controller.find
// );

router.post(
  "/",
  auth.authenticateToken,
  // validator.rules('create'),
  validator.validate,
  controller.create
);

// router.put(
//   "/:code",
//   auth.authenticateToken,
//   multer.uploadPDF,
//   validator.rules('update'),
//   validator.validate,
//   controller.update
// );

// router.put(
//   "/onprogress/:code",
//   auth.authenticateToken,
//   validator.validate,
//   controller.onProgres
// );

// router.put(
//   "/complete/:code",
//   auth.authenticateToken,
//   validator.validate,
//   controller.complete
// );

// router.put(
//   "/voidtoonprogress/:code",
//   auth.authenticateToken,
//   validator.validate,
//   controller.voidToOnProgress
// );

// router.delete(
//   "/:code",
//   auth.authenticateToken,
//   validator.validate,
//   controller.delete
// );

module.exports = router;
