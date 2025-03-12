const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logoutRouter = Router();

logoutRouter.get("/", (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "Lax", // Use "Lax" for local testing; "Strict" for production
  });
  res.status(200).json({ message: "Logout successful" });
});

module.exports = logoutRouter;
