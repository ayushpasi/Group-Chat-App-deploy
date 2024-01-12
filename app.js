const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const groupRouter = require("./routes/groupRouter");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const cors = require("cors");

const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const Group = require("./models/groupModel");
const UserGroup = require("./models/userGroup");

const app = express();

app.use(express.static("public"));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", userRouter);
app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/group", groupRouter);

//Relationships between Tables
User.hasMany(Chat, { onDelete: "CASCADE", hooks: true });

Chat.belongsTo(User);
Chat.belongsTo(Group);

User.hasMany(UserGroup);

Group.hasMany(Chat);
Group.hasMany(UserGroup);

UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error(err);
  });
