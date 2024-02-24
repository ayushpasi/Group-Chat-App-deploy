const path = require("path");
const User = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const sequelize = require("../util/database");
const { Op } = require("sequelize");
const GroupModel = require("../models/groupModel");
const S3servises = require("../services/S3services");

const sendMessage = async (req, res, next) => {
  try {
    const user = req.user;
    const { message, groupId } = req.body;
    const name = req.user.name;
    if (groupId == 0) {
      await user.createChat({
        name,
        message,
      });
    } else {
      await user.createChat({
        name,
        message,
        groupId,
      });
    }
    return res.status(200).json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error" });
  }
};

const getMessages = async (req, res, next) => {
  try {
    const param = req.params.param || 0;
    const messages = await ChatModel.findAll({
      where: {
        id: {
          [Op.gt]: param,
        },
        groupId: null,
      },
    });

    return res.status(200).json({ messages: messages });
  } catch (error) {
    console.log(error);
  }
};

const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.query;

    const messages = await ChatModel.findAll({
      where: { groupId: groupId },
    });
    return res.status(200).json({ messages: messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const saveChatImages = async (request, response, next) => {
  try {
    const user = request.user;
    const image = request.file;
    const { GroupId } = request.body;

    const filename = `chat-images/group${GroupId}/user${
      user.id
    }/${Date.now()}_${image.originalname}`;
    const imageUrl = await S3servises.uploadToS3(image.buffer, filename);

    if (GroupId == 0) {
      await user.createChat({
        name: user.name,
        message: imageUrl,
        isImage: true,
      });
    } else {
      await user.createChat({
        name: user.name,
        message: imageUrl,
        groupId: GroupId,
        isImage: true,
      });
    }
    return response
      .status(200)
      .json({ message: "image saved to database succesfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal Server error!" });
  }
};

module.exports = { sendMessage, getMessages, getGroupMessages, saveChatImages };
