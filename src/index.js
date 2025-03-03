const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const cors = require("cors");
const demoRouter = require("./routes/demo-routes");
const logicRoute = require("./controllers/logic-controller");

const app = express();
app.use(express.json());
app.use(cors());

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

app.use(function (req, res, next) {
  return next(createError(404, "Path not found"));
});

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
