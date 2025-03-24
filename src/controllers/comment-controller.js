const pool = require("../config/db");

const getComments = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM comments");
        console.log (result.rows);
        if (result.rows.length === 0) {
            return res.status(404).send("Comments not found");
        }
        res.status(200).json(result.rows);
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
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

const addComment = async (req, res) => {
    try {
        const article_id = req.params.article_id;
        const result_article_id = await pool.query("SELECT * FROM articles WHERE id = $1", [article_id]);
        console.log ("RESULT ARTICLE ID: " , result_article_id);
        if (result_article_id.rows.length === 0) {
            return res.status(404).send("Article not found");
        }
        const username = req.body.username;
        console.log ("USERNAME: " , username);
        const content = req.body.content;
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
        const email = req.body.email;
        console.log ("EMAIL: " , email);
        const result = await pool.query("INSERT INTO comments (username, content, email, article_id) VALUES ($1, $2, $3, $4) RETURNING *", [username, content, email,article_id]);
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

module.exports = { getComments, getComment, addComment, deleteComment };