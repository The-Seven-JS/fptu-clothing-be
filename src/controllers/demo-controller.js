const createError = require("http-errors");

const demoGetController = (req, res) => {
  res.json({
    message: "Hello, World!",
  });
};

const demoErrorController = (req, res, next) => {
  next(createError(400, "This is a demo error"));
};

module.exports = {
  demoGetController,
  demoErrorController,
};
