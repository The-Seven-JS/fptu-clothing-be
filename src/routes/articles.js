const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Truy vấn tất cả articles
router.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM articles");
      res.json(result.rows);
    } catch (err) {
      console.error("Lỗi truy vấn:", err);
      res.status(500).send("Lỗi server");
    }
  });

  //Thêm một article mới
  router.post("/new", async (req, res) => {
    try {
      const { title, content } = req.body;
      const result = await pool.query(  
        "INSERT INTO articles (title, content, status) VALUES ($1, $2, 'completed') RETURNING *",
        [title, content]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Lỗi truy vấn:", err);
      res.status(500).send("Lỗi server");
    }
  });

  //Xoá một article
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("DELETE FROM articles WHERE id = $1 RETURNING *", [id]);
      if (result.rowCount === 0)  
        return res.status(404).send("Article not found");
      else
        res.json({ message: "Article deleted successfully" , deletedArticle: result.rows[0] });
    } catch (err) {
      console.error("Lỗi truy vấn:", err);
      res.status(500).send("Lỗi server");
    }
  });

  //Chỉnh sửa một article
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const timestamp = new Date(Date.now()).toISOString();
      const result = await pool.query(
        "UPDATE articles SET title = $1, content = $2, updated_at = $3 WHERE id = $4 RETURNING *",
        [title, content, timestamp, id]
      );
      if (result.rowCount === 0)  
        return res.status(404).send("Article not found");
      else
        res.json({ message: "Article updated successfully", updatedArticle: result.rows[0] });
    } catch (err) {
      console.error("Lỗi truy vấn:", err);
      res.status(500).send("Lỗi server");
    }
  });

  

  module.exports = router