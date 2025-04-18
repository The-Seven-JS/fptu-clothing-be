const pool = require("../config/db");
const xss = require("xss");

const getComments = async (req, res) => {
    try {
        const result = await pool.query("SELECT comment_id, username, content, email, article_id, TO_CHAR(created_at, 'DD-MM-YYYY HH24:MI:SS') AS created_at, count FROM comments");
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
            created_at: comment.created_at,
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

        const result = await pool.query("SELECT comment_id, username, content, email, article_id, TO_CHAR(created_at, 'DD-MM-YYYY HH24:MI:SS') AS created_at, count FROM comments WHERE article_id = $1", [article_id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Comment not found");
        }
        const sanitizedComments = result.rows.map(comment => ({
            comment_id: comment.comment_id,
            username: xss(comment.username),
            content: xss(comment.content),
            email: xss(comment.email),
            article_id: comment.article_id,
            created_at: comment.created_at
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
        if (result_article_id.rows.length === 0) {
            return res.status(404).send("Article not found");
        }
        const count_comment = await pool.query("SELECT COUNT(*) FROM comments WHERE article_id = $1", [article_id]);
        console.log ("COUNT RESULT:", count_comment.rows);
        if (count_comment.rows[0].count === 0) {
            return res.status(404).send("Comment not found");
        }   
        const count = count_comment.rows[0].count;
        const result = await pool.query("SELECT * FROM ( SELECT ROW_NUMBER() OVER (ORDER BY comment_id) AS temp_id, comment_id, username, content, email, article_id, TO_CHAR(created_at, 'DD-MM-YYYY HH24:MI:SS') AS created_at FROM comments WHERE article_id = $1) WHERE temp_id >= $2 AND temp_id <= $3 ORDER BY temp_id DESC", [article_id, count - level*10 + 1, count- (level-1)*10])
        console.log ("RESULT:", result.rows);
        const sanitizedComments = result.rows.map(comment => ({
            comment_id: comment.comment_id,
            username: xss(comment.username),
            content: xss(comment.content),
            email: xss(comment.email),
            article_id: comment.article_id,
            created_at: comment.created_at,
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