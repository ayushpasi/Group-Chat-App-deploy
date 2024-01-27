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

router.get("/getGroup", groupController.getGroupbyId);

router.get("/getGroupMembers", groupController.getGroupMembersbyId);

router.post(
  "/updateGroup",
  userauthentication.authenticate,
  groupController.updateGroup
);
module.exports = router;
