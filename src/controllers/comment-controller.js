const pool = require("../config/db");
const xss = require("xss");

const getComments = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM comments");
        console.log (result.rows);
        if (result.rows.length === 0) {
            return res.status(404).send("Comments not found");
        }
        const sanitizedComments = result.rows.map(comment => ({
            comment_id: comment.comment_id,
            username: xss(comment.username),
            content: xss(comment.content),
            email: xss(comment.email),
            article_id: comment.article_id,
            count: comment.count
        }));




        res.status(200).json(sanitizedComments);




    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

const getComment = async (req, res) => {
    try {
        const { article_id } = req.params;
        if (article_id === undefined) {
            return res.status(400).send("article_id must be defined");
        }
        const result_article_id = await pool.query("SELECT * FROM articles WHERE id = $1", [article_id]);
        if (result_article_id.rows.length === 0) {
            return res.status(404).send("Article not found");
        }

        const result = await pool.query("SELECT * FROM comments WHERE article_id = $1", [article_id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Comment not found");
        }
        const sanitizedComments = result.rows.map(comment => ({
            comment_id: comment.comment_id,
            username: xss(comment.username),
            content: xss(comment.content),
            email: xss(comment.email),
            article_id: comment.article_id,
            count: comment.count
        }));
        res.status(200).json(sanitizedComments);
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

const getCommentLevel = async (req, res) => {
    try {
        const article_id = req.params.article_id
        const level = req.params.level;
        const result_article_id = await pool.query("SELECT * FROM articles WHERE id = $1", [article_id]);
        console.log ("RESULT ARTICLE ID: " , result_article_id);
        if (result_article_id.rows.length === 0) {
            return res.status(404).send("Article not found");
        }
        const result = await pool.query("SELECT * FROM comments WHERE article_id = $1 AND count >= $2 AND count <= $3", [article_id, (level-1)*10+1, level*10])
        console.log ("RESULT:", result.rows);
        const sanitizedComments = result.rows.map(comment => ({
            comment_id: comment.comment_id,
            username: xss(comment.username),
            content: xss(comment.content),
            email: xss(comment.email),
            article_id: comment.article_id,
            count: comment.count
        }));
        res.status(200).json(sanitizedComments);
    }
    catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
}


const addComment = async (req, res) => {
     try {
        const article_id = req.params.article_id;
        const result_article_id = await pool.query("SELECT * FROM articles WHERE id = $1", [article_id]);
        console.log ("RESULT ARTICLE ID: " , result_article_id);
        if (result_article_id.rows.length === 0) {
            return res.status(404).send("Article not found");
        }
        let { username, content, email } = req.body;

        console.log ("USERNAME: " , username);

        console.log ("CONTENT: " , content);
        if (typeof content !== "string" || typeof username !== "string") {
            return res.status(400).send("username and content must be strings");
        }
        if (username === undefined || content === undefined) {
            return res.status(400).send("username and content must be defined");
        }

         if (username.trim() === "" || content.trim() === "") {
            return res.status(400).send("Usrname and content should not be empty");
        }
        username = xss(username);
        content = xss(content);
        email = xss(email);
        console.log ("EMAIL: " , email);
        const newest_result = await pool.query("SELECT * FROM comments WHERE article_id = $1 ORDER BY count DESC LIMIT 1", [article_id]);
        let count;
        if (newest_result.rows.length === 0) 
            count = 1;
        else
            count = newest_result.rows[0].count + 1;
        const result = await pool.query("INSERT INTO comments (username, content, email, article_id, count) VALUES ($1, $2, $3, $4, $5) RETURNING *", [username, content, email, article_id, count]);
        console.log(result.rows);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

const deleteComment = async (req, res) => {
    try {
        const { comment_id } = req.params;
        const result_comment_id = await pool.query("SELECT * FROM comments WHERE comment_id = $1", [comment_id]);
        console.log ("RESULT COMMENT ID: " , result_comment_id);
        if (result_comment_id.rows.length === 0) {
            return res.status(404).send("Comment not found");
        }
        const article_id = req.params.article_id;
        console.log ("ARTICLE ID: " , article_id);
        const result_article_id = await pool.query("SELECT * FROM articles WHERE id = $1", [article_id]);
        if (result_article_id.rows.length === 0) {
            return res.status(404).send("Article not found");
        }
        if (result_comment_id.rows[0].article_id !== parseInt(article_id)){
            return res.status(404).send("Conflict between comment_id and article_id");
        }
        const result = await pool.query("DELETE FROM comments WHERE comment_id = $1 AND article_id = $2 RETURNING *", [comment_id, article_id]);
        res.status(200).json({ message: "Comment deleted successfully" , comment: result.rows[0]});
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

module.exports = { getComments, getComment, getCommentLevel, addComment, deleteComment };