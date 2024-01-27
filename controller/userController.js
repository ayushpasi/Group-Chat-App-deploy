const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

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
const generateAccessToken = (id, name) => {
  return jwt.sign({ userId: id, name: name }, process.env.TOKEN_SECRET);
};
const postUserLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ where: { email: email } });
    if (existingUser) {
      bcrypt.compare(password, existingUser.password, (err, result) => {
        if (err) {
          res.status(500).json({ error: "somthing went wrong" });
        }
        if (result == true) {
          res.status(200).json({
            message: "user logged in succesfully",
            token: generateAccessToken(existingUser.id, existingUser.name),
          });
        } else {
          res.status(401).json({ error: "User not authorized" });
        }
      });
    } else {
      res.status(404).json({ error: "User Not Found" });
    }
  } catch (err) {
    console.log(err);
  }
};

const getAlluser = async (req, res, next) => {
  try {
    const user = req.user;
    const users = await UserModel.findAll({
      attributes: ["id", "name", "email"],
      where: {
        id: {
          [Op.not]: user.id,
        },
      },
    });
    return res
      .status(200)
      .json({ users, message: "All users succesfully fetched" });
  } catch (error) {
    console.log(error);
    returnres.status(500).json({ message: "Internal Server error!" });
  }
};

const getcurrentuser = async (req, res) => {
  const user = req.user;
  res.status(200).json({ userId: user.id, user });
};
module.exports = {
  userSignup,
  getHomePage,
  postUserLogin,
  getAlluser,
  getcurrentuser,
};
