const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
// Import Server from socket.io

dotenv.config();
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const groupRouter = require("./routes/groupRouter");
const resetPasswordRouter = require("./routes/resetPasswordRouter");

const sequelize = require("./util/database"); // Make sure to destructure sequelize from database object
const bodyParser = require("body-parser");
const cors = require("cors");

const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const Group = require("./models/groupModel");
const UserGroup = require("./models/userGroup");
const ResetPassword = require("./models/resetPasswordModel");
const websocketService = require("./services/websocket");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

app.use("/password", resetPasswordRouter);

io.on("connection", websocketService);

//Relationships between Tables
User.hasMany(Chat, { onDelete: "CASCADE", hooks: true });

Chat.belongsTo(User);
Chat.belongsTo(Group);

User.hasMany(UserGroup);

Group.hasMany(Chat);
Group.hasMany(UserGroup);

UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);

ResetPassword.belongsTo(User);
User.hasMany(ResetPassword);

const job = require("./services/corn");
job.start();

sequelize
  .sync({ alter: true })
  .then(() => {
    server.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error(err);
  });
