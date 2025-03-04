const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const pool = require("../database/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
const requireAuth = require("../middleware/authmiddleware");
const loginRoute = require("./routes/login-route");
const logoutRoute = require("./routes/logout-route");

dotenv.config();
const app = express();
app.use(
  cors({ 
    credentials: true,
  })
); // Allow frontend requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to PostgreSQL at:", res.rows[0].now);
});

app.use("/login", loginRoute);
app.use("/logout", logoutRoute);

app.get("/admin", requireAuth, (req, res) => {
  res.json({ message: "Welcome to Admin Page" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
