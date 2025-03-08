const express = require("express");
const router = express.Router();
const articleController = require("../controllers/article-controller");

// Truy vấn tất cả articles
router.get("/", articleController.getArticles);

//Thêm một article mới
  router.post("/new", articleController.addArticle);

  //Xoá một article
  router.delete("/:id", articleController.deleteArticle);

  //Chỉnh sửa một article
  router.put("/:id", articleController.updateArticle);

  module.exports = router