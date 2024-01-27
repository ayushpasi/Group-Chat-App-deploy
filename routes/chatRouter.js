const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const userauthentication = require("../middleware/authentication");

router.post(
  "/sendMessage",
  userauthentication.authenticate,
  chatController.sendMessage
);

router.get("/getMessages/:param", chatController.getMessages);

router.get(
  "/getGroupMessages",

  chatController.getGroupMessages
);
module.exports = router;
