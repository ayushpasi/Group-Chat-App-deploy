const express = require("express");
const userController = require("../controller/userController");
const userauthentication = require("../middleware/authentication");

const router = express.Router();

router.get("/", userController.getHomePage);

router.get("/mainpage", userController.getMainPage);

router.post("/signup", userController.userSignup);

router.post("/login", userController.postUserLogin);

router.get(
  "/getUsers",
  userauthentication.authenticate,
  userController.getAlluser
);

router.get(
  "/getCurrentUser",
  userauthentication.authenticate,
  userController.getcurrentuser
);
module.exports = router;
