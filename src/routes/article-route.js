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
<<<<<<< HEAD
router.delete("/:article_id", requireAuth, articleController.deleteArticle);

//Chỉnh sửa một article
router.put("/:article_id", requireAuth, articleController.updateArticle);
=======
  router.delete("/delete-article/:article_id", articleController.deleteArticle);

// Xoá một article draft
  router.delete("/delete-draft", articleController.deleteDraft);
  
//Chỉnh sửa một article
  router.put("/:article_id", articleController.updateArticle);
>>>>>>> 099670ad3da23f451b668bb6684f340ddcb07a23

module.exports = router;
