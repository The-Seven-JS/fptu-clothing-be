const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment-controller");
const requireAuth = require("../middleware/authmiddleware");

// Lấy toàn bộ comments
router.get("/", commentController.getComments);
// Lấy toàn bộ comments theo 1 id bài viết
router.get('/:article_id', commentController.getComment);
// Lấy 10 comments theo 1 id bài viết
router.get('/:article_id/:level', commentController.getCommentLevel);
// Thêm 1 comment mới vào bài viết cụ thể
router.post("/new/:article_id", commentController.addComment);
// Xoá 1 comment của 1 bài viết cụ thể
router.delete("/delete/:article_id/:comment_id", requireAuth, commentController.deleteComment);





module.exports = router