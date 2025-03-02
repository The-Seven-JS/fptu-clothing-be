const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const cors = require("cors");
const demoRouter = require("./routes/demo-routes");

const app = express();
app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api/demo", demoRouter);

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

const attribute_data_male = require("./attribute_data_male.json");
const attribute_data_female = require("./attribute_data_female.json");
const male_advice = require("./male_advice.json");
const female_advice = require("./female_advice.json");

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
