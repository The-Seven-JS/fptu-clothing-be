const { Router } = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const loginRoute = Router();
const xss = require("xss");


const createToken = (name) => {
  return jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

loginRoute.use(bodyParser.json());

loginRoute.post("/", async (req, res) => {
  const { name, password } = req.body;
  name = xss(name);
  password = xss(password);
  if (!name?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json({ error: "Username and password cannot be empty or spaces only." });
  }
  try {
    const result = await pool.query("SELECT * FROM admin WHERE name = $1", [
      name,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Wrong username" });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(400).json({ error: "Wrong password" });

    const token = createToken(name);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "User login failed" });
  }
});

module.exports = loginRoute;
