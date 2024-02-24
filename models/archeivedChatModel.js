const sequelize = require("../util/database");
const Sequelize = require("sequelize");

const ArchivedChat = sequelize.define("archivedChats", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  message: {
    type: Sequelize.STRING,
  },
  isImage: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  userId: {
    type: Sequelize.BIGINT,
  },
  groupId: {
    type: Sequelize.BIGINT,
  },
});

module.exports = ArchivedChat;
