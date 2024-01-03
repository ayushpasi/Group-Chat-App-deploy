const path = require("path");
const User = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const sequelize = require("../util/database");

const sendMessage = async (req, res, next) => {
  try {
    await ChatModel.create({
      name: req.user.name,
      message: req.body.message,
      userId: req.user.id,
    });
    return res.status(200).json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error" });
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await ChatModel.findAll();
    return res.status(200).json({ messages: messages });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendMessage, getMessages };
