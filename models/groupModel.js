const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const GroupModel = sequelize.define("group", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  admin: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = GroupModel;
