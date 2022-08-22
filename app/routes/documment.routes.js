const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/document/document.controller");
const multer = require("../middleware/multer.middleware");

// ============================== USER ==============================

router.get(
  "/",
  auth.authenticateToken,
  controller.findAll
);

router.get(
  "/:code",
  auth.authenticateToken,
  controller.find
);

router.post(
  "/",
  auth.authenticateToken,
  controller.validate('createDocument'), 
  controller.create
);

// router.put(
//   "/:code",
//   auth.authenticateToken,
//   controller.validate('updateUser'),
//   controller.updateUser
// );

// router.put(
//   "/reset-password/:code",
//   auth.authenticateToken,
//   controller.validate('resetPassword'),
//   controller.resetPassword
// );

router.delete(
  "/:code",
  auth.authenticateToken,
  controller.deleteDocument
);

router.post("/upload-excel",
  auth.authenticateToken,
  multer.uploadExcel,
  controller.uploadExcel
);

router.post("/upload-pdf/:folder/:code", 
  auth.authenticateToken,
  multer.uploadPDF,
  controller.uploadPdf
);

module.exports = router;
