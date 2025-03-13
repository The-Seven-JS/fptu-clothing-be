const pool = require("../config/db");
const cloudinary = require("cloudinary").v2

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
    api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
})

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
        const { article_id } = req.params; // Nhờ Đăng validate lỡ article_id khoong tồn tại
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
      const { title, content } = req.body;
      if (!title || !content) return res.status(400).send("Missing title or content");
      else {  
        const result = await pool.query(
        "INSERT INTO articles (title, content, status) VALUES ($1, $2, 'completed') RETURNING *",[title, content]);
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
        const { article_id } = req.params; // Nhờ Đăng validate thêm lỡ article_id không tồn tại
        const result_image = await pool.query("SELECT public_id FROM article_images WHERE article_id = $1", [article_id]);
        console.log ("RESULT IMAGE: ",result_image);
        await pool.query("DELETE FROM article_images WHERE article_id = $1", [article_id]); 
        const delete_image = await cloudinary.api.delete_resources(result_image.rows.map(image => image.public_id));
        console.log ("DELETE IMAGE: ", delete_image);
        const result = await pool.query("DELETE FROM articles WHERE id = $1 RETURNING *", [article_id]);
        console.log(req.originalUrl);
        console.log ("DELETE ARTICLE: ",result.rows);
        if (result.rowCount === 0)
            return res.status(404).send("Article not found");
        else
            res.json({ message: "Article deleted successfully" , deletedArticle: result.rows[0] });
    } catch (err) {
        console.error("Lỗi truy vấn:", err);
        res.status(500).send("Lỗi server");
    }
};

//Chỉnh sửa một article
const updateArticle = async (req, res) => {
    try {
        const { article_id } = req.params;
        const { title, content } = req.body;
        const timestamp = new Date(Date.now()).toISOString();
        const result = await pool.query(    
            "UPDATE articles SET title = $1, content = $2, updated_at = $3 WHERE id = $4 RETURNING *",
            [title, content, timestamp, article_id]
        );
        console.log(req.originalUrl);
        console.log (result.rows);
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