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
        const result = await pool.query("SELECT * FROM articles");
        console.log(req.originalUrl);
        console.log(result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

// Truy vấn 1 article
const getArticle = async (req, res) => {
    try {
        const { article_id } = req.params; // Nhờ Tus validate lỡ article_id khoong tồn tại
        const result = await pool.query("SELECT * FROM articles WHERE id = $1", [article_id]);
        const result2 = await pool.query("SELECT public_id FROM article_images WHERE article_id = $1", [article_id]);
        console.log(req.originalUrl);
        console.log(result.rows);
        console.log (result2);
        res.json({ article: result.rows[0], images: result2.rows });
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

//Thêm một article mới
const addArticle = async (req, res) => {
    try {
        const validationError = validateRequestBody(req.body, uniqueKey);
        if (validationError) {
            return res.status(400).send(validationError);
        }
        const { title, content } = req.body;
        if (!title || !content) return res.status(400).send("Missing title or content");
        if (typeof title !== "string" || typeof content !== "string") return res.status(400).send("title and content must be strings");
        if (content.length === 0) return res.status(400).send("content should not be empty");
        else {
            const result = await pool.query(
                "INSERT INTO articles (title, content, status) VALUES ($1, $2, 'completed') RETURNING *", [title, content]);
            console.log(result.rows);
            res.json(result.rows[0]);
        }
        console.log(req.originalUrl);

    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

//Xoá một article
const deleteArticle = async (req, res) => {
    try {
        const { article_id } = req.params; // Nhờ Tus validate thêm lỡ article_id không tồn tại   
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
        const result = await pool.query("DELETE FROM articles WHERE id = $1 RETURNING *", [numId]);
        console.log ("DELETE ARTICLE: ",result.rows);
        if (result.rowCount === 0)
            return res.status(404).send("Article not found");
        else
            res.json({ message: "Article deleted successfully", deletedArticle: result.rows[0] });
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

//Chỉnh sửa một article
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
        if (!title || !content) {
            return res.status(400).send("Missing title or content");
        }
        if (typeof title !== "string" || typeof content !== "string") {
            return res.status(400).send("title and content must be strings");
        }

        const checkExist = await pool.query("SELECT * FROM articles WHERE id = $1", [numId]);
        if (checkExist.rowCount === 0) {
            return res.status(404).json({ error: "article not found" });
        }
        const timestamp = new Date(Date.now()).toISOString();
        const result = await pool.query(
            "UPDATE articles SET title = $1, content = $2, updated_at = $3 WHERE id = $4 RETURNING *",
            [title, content, timestamp, numId]
        );
        console.log(req.originalUrl);
        console.log(result.rows);
        if (result.rowCount === 0)
            return res.status(404).send("Article not found");
        else
            res.json({ message: "Article updated successfully", updatedArticle: result.rows[0] });
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