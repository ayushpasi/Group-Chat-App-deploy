const express = require("express");
const router = express.Router();
const groupController = require("../controller/groupController");
const userauthentication = require("../middleware/authentication");

router.post(
  "/createGroup",
  userauthentication.authenticate,
  groupController.createGroup
);

router.get(
  "/getGroups",
  userauthentication.authenticate,
  groupController.getGroups
);
module.exports = router;
