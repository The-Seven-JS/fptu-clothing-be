const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM article"); // Truy vấn tất cả users
      res.json(result.rows);
    } catch (err) {
      console.error("Lỗi truy vấn:", err);
      res.status(500).send("Lỗi server");
    }
  });

  router.post("/new", async (req, res) => {
    try {
      const { title, content } = req.body;
      const timestamp = new Date(Date.now()).toISOString();
      const result = await pool.query(  
        "INSERT INTO article (created_at, title, content, status) VALUES ($1, $2, $3, 'completed') RETURNING *",
        [timestamp, title, content]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Lỗi truy vấn:", err);
      res.status(500).send("Lỗi server");
    }
  });

  

  module.exports = router