const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const cors = require("cors");
const usersRouter = require("./routes/article-route");
const demoRouter = require("./routes/demo-routes");
const logicRoute = require("./routes/logic-route");
const photoRouter = require("./routes/photo-route");


const app = express();
app.use(express.json());
app.use(cors());
// Add middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))


app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api/demo", demoRouter);
app.use("/", logicRoute);
app.get("/", (req, res) => {
  res.json({
    message: "welcome to our website",
  });
});


// Sử dụng router của articles.js
app.use("/articles", usersRouter);

// Sử dụng router của photos.js
app.use("/photos", photoRouter);

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
