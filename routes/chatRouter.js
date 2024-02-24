const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");
const userauthentication = require("../middleware/authentication");
const multerMiddleware = require("../middleware/multer");
const upload = multerMiddleware.multer.single("image");

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

router.post(
  "/postImage",
  userauthentication.authenticate,
  upload,
  chatController.saveChatImages
);
module.exports = router;
