const express = require("express");
const router = express.Router();
const auth = require("../middleware/jwt.middleware");
const controller = require("../modules/group/group.controller");


// ============================== USER ==============================

router.get(
  "/list",
  auth.authenticateToken,
  controller.getGroupList
);


module.exports = router;
