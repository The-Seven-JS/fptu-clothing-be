const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article-controller");

// Truy vấn tất cả articles
  router.get("/", articleController.getArticles);

//Truy vấn 1 article
  router.get("/:article_id", articleController.getArticle);

//Thêm một article mới
  router.post("/new", articleController.addArticle);

//Xoá một article
  router.delete("/delete-article/:article_id", articleController.deleteArticle);

// Xoá một article draft
  router.delete("/delete-draft", articleController.deleteDraft);
  
//Chỉnh sửa một article
  router.put("/:article_id", articleController.updateArticle);

  module.exports = router