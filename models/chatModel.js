const sequelize = require("../util/database");
const Sequelize = require("sequelize");

const ChatModel = sequelize.define("chat", {
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
});

module.exports = ChatModel;
