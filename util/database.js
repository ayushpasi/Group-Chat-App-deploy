const Sequelize = require("sequelize");

const sequelize = new Sequelize("chatapp", "root", "root", {
  dialect: "mysql",
  host: "localhost",
  port: 3308, // Make sure this is an integer, not a string
});

module.exports = sequelize;
