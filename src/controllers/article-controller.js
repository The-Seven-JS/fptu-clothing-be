const pool = require("../config/db");
const cloudinary = require("cloudinary").v2

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
    api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
})

const uniqueKey = ["title", "content"]; //key to check


const validateRequestBody = (body, allowedKeys) => {
    const keys = Object.keys(body);
    const invalidKeys = keys.filter(key => !allowedKeys.includes(key));

    if (invalidKeys.length > 0) {
        return `containing spy attribute(s): ${invalidKeys.join(", ")}`;

    }
    return null;
};


// Truy vấn tất cả articles
const getArticles = async (req, res) => {
    try {
        const result = await pool.query("SELECT id, TO_CHAR(created_at, 'DD-MM-YYYY') AS created_at, title, content, status, TO_CHAR(updated_at, 'DD-MM-YYYY') AS updated_at, (SELECT COUNT(*) FROM article_images WHERE article_id = articles.id) AS image_count, (SELECT COUNT(*) FROM comments WHERE article_id = articles.id) AS comment_count FROM articles");
        if (result.rows.length === 0) {
            return res.status(404).send("Articles not found");
        }
        console.log(req.originalUrl);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

// Truy vấn 1 article
const getArticle = async (req, res) => {
    try {
        const { article_id } = req.params;
        const result = await pool.query("SELECT id, TO_CHAR(created_at, 'DD-MM-YYYY') AS created_at, title, content, status, TO_CHAR(updated_at, 'DD-MM-YYYY') AS updated_at, (SELECT COUNT(*) FROM article_images WHERE article_id = articles.id) AS image_count, (SELECT COUNT(*) FROM comments WHERE article_id = articles.id) AS comment_count FROM articles WHERE id = $1", [article_id]);
        if (result.rows.length === 0) {
            return res.status(404).send("Article not found");
        }
        const result2 = await pool.query("SELECT public_id, url, article_id FROM article_images WHERE article_id = $1", [article_id]);
        const result3 = await pool.query("SELECT comment_id, username, content, email, created_at, article_id FROM comments WHERE article_id = $1", [article_id]);
        console.log(req.originalUrl);
        console.log("ARTICLE", result.rows);
        console.log ("IMAGES", result2);
        console.log ("COMMENTS", result3);
        res.status(200).json({ article: result.rows[0], images: result2.rows , comments: result3.rows });
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

//Thêm một article mới - 1 draft, không có gì cả để updateArticle sau. (KHÔNG CÓ VLD)
const addArticle = async (req, res) => {
    try {
        const result = await pool.query("INSERT INTO articles (title, content, status) VALUES ($1, $2, 'draft') RETURNING *", ["New Post", "<p></p>"]);
        console.log(result.rows);
        const result1 = await pool.query("SELECT id, TO_CHAR(created_at, 'DD-MM-YYYY') AS created_at, title, content, status, updated_at FROM articles WHERE id = $1", [result.rows[0].id]);
        console.log(result1.rows);
        res.status(201).json(result1.rows[0]);
        console.log(req.originalUrl);

    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

//Xoá một article
const deleteArticle = async (req, res) => {
    try {
        const { article_id } = req.params; 
        console.log(req.originalUrl);
        const numId = parseInt(article_id, 10);
        if (isNaN(numId) || numId < 0) {
            return res.status(400).send("wrong id");
        }
        console.log ("NUM ID: ",numId);
        const result_image = await pool.query("SELECT public_id FROM article_images WHERE article_id = $1", [numId]);
        console.log ("RESULT IMAGE: ",result_image);
        if (result_image.rows.length === 0) {
           console.log ("NO IMAGE");
        }
        else {
            await pool.query("DELETE FROM article_images WHERE article_id = $1", [numId]); 
            const delete_image = await cloudinary.api.delete_resources(result_image.rows.map(image => image.public_id));
            console.log ("DELETE IMAGE: ", delete_image);
        }
        const result_comment = await pool.query("SELECT comment_id FROM comments WHERE article_id = $1", [numId]);
        console.log ("RESULT COMMENT: ",result_comment);
        if (result_comment.rows.length === 0) {
            console.log ("NO COMMENT");
        }
        else {
            const result_delete_comment = await pool.query("DELETE FROM comments WHERE article_id = $1", [numId]);
            console.log ("DELETE COMMENT: ",result_delete_comment);
        }
        const result = await pool.query("DELETE FROM articles WHERE id = $1 RETURNING *", [numId]);
        console.log ("DELETE ARTICLE: ",result.rows);
        if (result.rowCount === 0)
            return res.status(404).send("Article not found");
        else
            res.status(200).json({ message: "Article deleted successfully", deletedArticle: result.rows[0] });
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

//Chỉnh sửa một article - tu them bai viet rong roi edit nen khong vld missing title/content 
const updateArticle = async (req, res) => {
    try {
        const { article_id } = req.params;
        const validationError = validateRequestBody(req.body, uniqueKey);
        if (validationError) {
            return res.status(400).send(validationError);
        }
        const { title, content } = req.body;
        const numId = parseInt(article_id, 10)
        if (isNaN(numId)||numId<=0) {
            return res.status(400).send("wrong id");
        }

        const checkExist = await pool.query("SELECT * FROM articles WHERE id = $1", [numId]);
        if (checkExist.rowCount === 0) {
            return res.status(404).json({ error: "article not found" });
        }
    
        if (title === ""  || content.search('</h1>') === -1 || content.search('<h1></h1>') !== -1 || content.search('</h2>') === -1 || content.search('<h2 data-level="2"></h2>') !== -1) {
            return res.status(400).send("title should not be empty and content must have heading, summary");
        }
        if (typeof title !== "string" || typeof content !== "string") {
            return res.status(400).send("title and content must be strings");
        }
        if (title === undefined || content === undefined) {
            return res.status(400).send("title and content must be defined");
        }

         if (content.trim() === "<p></p>") {
            return res.status(400).send("Content should not be empty");
        }
        

        const result = await pool.query(
            "UPDATE articles SET title = $1, content = $2, status = 'completed', updated_at = NOW() WHERE id = $3 RETURNING *",
            [title, content, numId]
        );
        console.log(req.originalUrl);
        console.log(result.rows);
        const result1 = await pool.query("SELECT id, TO_CHAR(created_at, 'DD-MM-YYYY') AS created_at, title, content, status, TO_CHAR(updated_at, 'DD-MM-YYYY') AS updated_at FROM articles WHERE id = $1", [numId]);
        console.log(result1.rows);
        res.status(200).json({ message: "Article updated successfully", updatedArticle: result1.rows[0] });
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};


module.exports = {
    getArticles,
    getArticle,
    addArticle,
    deleteArticle,
    updateArticle
};