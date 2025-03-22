const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment-controller");

// Lấy toàn bộ comments
router.get("/", commentController.getComments);
// Lấy 1 comment theo id bài viết
router.get('/:article_id', commentController.getComment);
// Thêm 1 comment mới vào bài viết cụ thể
router.post("/new/:article_id", commentController.addComment);
// Xoá 1 comment của 1 bài viết cụ thể
router.delete("/delete/:article_id/:comment_id", commentController.deleteComment);





module.exports = router