const { CronJob } = require("cron");
const Sequelize = require("sequelize");
const Chat = require("../models/chatModel");
const ArchivedChat = require("../models/archeivedChatModel");

const job = new CronJob("0 0 * * *", async function () {
  // Runs at midnight every day
  const fiveSecondsAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago

  try {
    const chats = await Chat.findAll({
      where: {
        createdAt: {
          [Sequelize.Op.lt]: fiveSecondsAgo,
        },
      },
    });

    await ArchivedChat.bulkCreate(
      chats.map((chat) => ({
        id: chat.id,
        name: chat.name,
        message: chat.message,
        isImage: chat.isImage,
        userId: chat.userId,
        groupId: chat.groupId,
        createdAt: chat.createdAt,
      }))
    );

    await Chat.destroy({
      where: {
        createdAt: {
          [Sequelize.Op.lt]: fiveSecondsAgo,
        },
      },
    });
  } catch (error) {
    console.error("Error:", error);
  }
});

module.exports = job;
