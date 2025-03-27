const { Router } = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const changePassRoute = Router();

changePassRoute.use(bodyParser.json());

changePassRoute.patch("/", async (req, res) => {
  const { oldPass, newPass, retypePass } = req.body;
  // if (!oldPass?.trim() || newPass?.trim() || retypePass?.trim()) {
  //   return res
  //     .status(400)
  //     .json({ error: "Password cannot be empty or spaces only." });
  // }
  const result = await pool.query("SELECT * FROM admin");
  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(oldPass, user.password);

  if (!passwordMatch) return res.status(400).json({ error: "Wrong password" });
  if (newPass !== retypePass)
    return res.status(400).json({ error: "Password doesn't mastch" });
  const hashedPassword = await bcrypt.hash(newPass, 10);
  await pool.query(`UPDATE admin SET password = $1`, [hashedPassword]);
  res.status(200).json({ message: "Change password successfully" });
});

module.exports = changePassRoute;
