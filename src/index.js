const express = require("express");
const createError = require("http-errors");
const cors = require("cors");
const articleRouter = require("./routes/article-route");
const demoRouter = require("./routes/demo-routes");
const logicRoute = require("./routes/logic-route");
const photoRouter = require("./routes/photo-route");
const loginRoute = require("./routes/login-route");
const logoutRoute = require("./routes/logout-route");
const changePassRoute = require("./routes/change-password-route");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const requireAuth = require("./middleware/authmiddleware");
const pool = require("./config/db");
const path = require("path");
const bodyParser = require("body-parser");
const commentRouter = require("./routes/comment-route");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to PostgreSQL at:", res.rows[0].now);
});

app.use("/login", loginRoute);
app.use("/logout", logoutRoute);
app.use("/api/demo", demoRouter);
app.use("/", logicRoute);
app.get("/", (req, res) => {
  console.log(req.cookies);
  res.json({
    message: "welcome to our website",
  });
});

app.get("/admin", requireAuth, (req, res) => {
  res.status(200).json({
    message: "success",
  });
});

app.use((req, res, next) => {
  console.log("Received request:");
  console.log("Headers1:", req.headers);
  console.log("Headers2:", req.headers["content-type"]);
  console.log("Body:", req.body);
  console.log("FILES", req.files);
  next();
});

// Sử dụng router của articles.js
app.use("/articles", articleRouter);

// Sử dụng router của photos.js
app.use("/photos", requireAuth, photoRouter);
// Router đổi mật khẩu
app.use("/changepass", requireAuth, changePassRoute);

//Sử dụng router của comments.js
app.use("/comments", commentRouter);

//Middleware xử lý lỗi 404
app.use(function (req, res, next) {
  return next(createError(404, "Path not found"));
});

//Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    code: err.status || 500,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
