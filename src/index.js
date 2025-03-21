const express = require("express");
const createError = require("http-errors");
const cors = require("cors");
const articleRouter = require("./routes/article-route");
const demoRouter = require("./routes/demo-routes");
const logicRoute = require("./routes/logic-route");
const photoRouter = require("./routes/photo-route");
const commentRouter = require("./routes/comment-route");
require('dotenv').config();


const app = express();

// Add middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))

app.use(express.json());
app.use(cors());



app.use("/api/demo", demoRouter);
app.use("/", logicRoute);
app.get("/", (req, res) => {
  res.json({
    message: "welcome to our website",
  });
});

app.use((req, res, next) => {
  console.log("Received request:");
  console.log("Headers1:", req.headers);
  console.log("Headers2:", req.headers["content-type"]);
  console.log("Body:", req.body);
  console.log ("FILES" ,req.files);
  console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
  next();
});


// Sử dụng router của articles.js
app.use("/articles", articleRouter);

// Sử dụng router của photos.js
app.use("/photos", photoRouter);

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
