const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const cors = require("cors");

const User = require("./models/userModel");
const Chat = require("./models/chatModel");
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
User.hasMany(Chat);
Chat.belongsTo(User);

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
