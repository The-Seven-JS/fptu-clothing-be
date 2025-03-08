const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logoutRouter = Router();

logoutRouter.get("/", (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logout successful" });
});

module.exports = logoutRouter;
