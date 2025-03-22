const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article-controller");
const requireAuth = require("../middleware/authmiddleware");

// Truy vấn tất cả articles
router.get("/", articleController.getArticles);

//Truy vấn 1 article
router.get("/:article_id", articleController.getArticle);

//Thêm một article mới
router.post("/new", requireAuth, articleController.addArticle);

//Xoá một article
router.delete("/:article_id", requireAuth, articleController.deleteArticle);

//Chỉnh sửa một article
router.put("/:article_id", requireAuth, articleController.updateArticle);

module.exports = router;
