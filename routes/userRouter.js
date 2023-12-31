const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/", userController.getHomePage);

router.post("/signup", userController.userSignup);

router.post("/login", userController.postUserLogin);
module.exports = router;
