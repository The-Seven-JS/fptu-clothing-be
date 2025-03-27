const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article-controller");
const requireAuth = require("../middleware/authmiddleware");

// Truy vấn tất cả articles
router.get("/", articleController.getArticles);

// Truy vấn tất cả articles theo một số chữ cái nhận được
router.get("/get-articles-keyword", articleController.getArticlesKeyword);

//Truy vấn 1 article
router.get("/get-article/:article_id", articleController.getArticle);

// Truy vấn tất cả article draft
router.get("/get-drafts", requireAuth, articleController.getDrafts);

//Thêm một article mới
router.post("/new", requireAuth, articleController.addArticle);

//Xoá một article
router.delete(
  "/delete-article/:article_id",
  requireAuth,
  articleController.deleteArticle
);

// Xoá tất cả article draft
router.delete("/delete-drafts", requireAuth, articleController.deleteDrafts);

//Chỉnh sửa một article
router.put("/:article_id", requireAuth, articleController.updateArticle);

module.exports = router;
