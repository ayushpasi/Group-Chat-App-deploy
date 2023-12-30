const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routes/userRouter");
const sequelize = require("./util/database");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
dotenv.config();
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
