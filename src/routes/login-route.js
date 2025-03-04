const { Router } = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../database/database");
const loginRoute = Router();

const createToken = (name) => {
  return jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

loginRoute.use(bodyParser.json());

loginRoute.post("/", async (req, res) => {
  const { name, password } = req.body;
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
    res.cookie("jwt", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: "User login failed" });
  }
});

module.exports = loginRoute;
