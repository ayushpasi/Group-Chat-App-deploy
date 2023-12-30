const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");

const userSignup = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  console.log(req.body.name);
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Mobile:", mobile);
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ error: "Some data is missing" });
  }

  try {
    const existingUser = await UserModel.findOne({ where: { email: email } });

    if (existingUser) {
      return res.status(409).json({
        error: "This email is already taken. Please choose another one.",
      });
    }
    bcrypt.hash(password, 10, async (err, hash) => {
      // Only create a new user if all required data is present and the email doesn't exist
      const newUser = await UserModel.create({
        name,
        email,
        mobile,
        password: hash,
      });

      res.status(200).json({ message: "Registered successfully!" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getHomePage = async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../", "public", "views", "home.html"));
  } catch (error) {
    console.log(error);
  }
};

module.exports = { userSignup, getHomePage };
