require("dotenv").config()
const multer = require("multer")
const fs = require("fs")
const cloudinary = require("cloudinary").v2
const path = require("path")
const { get } = require("http")
const pool = require("../config/db");

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
    api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
})

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
]

// Validate file extension
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error(`Only ${ALLOWED_EXTENSIONS.join(", ")} files are allowed`))
    }
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        // Sanitize filename
        const sanitizedFilename = path
            .basename(file.originalname)
            .replace(/[^a-zA-Z0-9.-]/g, "_")
        cb(null, Date.now() + "-" + sanitizedFilename)
    },
})

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
})
// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// Utility function for Cloudinary upload
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
         cloudinary.uploader.upload(file.path, (error, result) => {
            if (error) reject(error)
            else resolve(result)
            // Remove local file after upload
            fs.unlinkSync(file.path)
        })
    })
}

const getURLController = async (req, res) => {
    try {
        const publicId = req.body.public_id;
        console.log("PUBLIC ID:", publicId);
        const result = await cloudinary.api.resources_by_ids(publicId);
        console.log ("RESULT: " ,result)
        const urls = result.resources.map(resource => resource.secure_url);
        res.json({
            urls: urls
        })
    } catch (error) {
        res.status(500).send(
            "Error uploading to Cloudinary: " + error.message
        )
    }
}

const addPhotoController = async (req, res) => {
            const article_id = req.params.article_id; //nhờ Đăng validate thêm lỡ article_id không tồn tại
            console.log("BODY:", req.body);
            console.log ("FILES" ,req.files);
            if (!req.files || req.files.length === 0) {
                return res.status(400).send("No file uploaded.")
            }   
            try {
                const result = await Promise.all(
                    req.files.map(file => uploadToCloudinary(file))
                );
                res.json({
                    message: "File uploaded successfully to Cloudinary",
                    public_id: result.map(file => file.public_id),
                    url: result.map(file => file.secure_url),
                    article_id: article_id
                })
        
                 await Promise.all(result.map(file => {pool.query("INSERT INTO article_images (public_id, article_id) VALUES ($1, $2)", [file.public_id, article_id])}));
                console.log ("RESULT" , result);
            } catch (error) {
                res.status(500).send(
                    "Error uploading to Cloudinary: " + error.message
                )
            }
}

const deletePhotoController = async (req, res) => {
    try {
        const publicId = req.params.public_id;
        const article_id = req.params.article_id; //Nhờ Đăng validate thêm lỡ article_id không tồn tại
        console.log(publicId);
        result = await cloudinary.uploader.destroy(publicId);
        console.log(result);
        if (result.result === "not found") {
            return res.status(404).send("File not found in Cloudinary");
        }
        await pool.query("DELETE FROM article_images WHERE public_id = $1", [publicId]);
        return res.json({ message: "File deleted successfully from Cloudinary" });
    } catch (error) {
        res.status(500).send("Error deleting from Cloudinary: " + error.message);
    }
}

const updatePhotoController = async (req, res) => {
    try {
            console.log(req.originalUrl);
            const publicId = req.params.public_id;
            const article_id = req.params.article_id; //Nhờ Đăng validate thêm lỡ article_id không tồn tại
            console.log("PUBLIC ID:", publicId);
            console.log("ARTICLE ID:", article_id);
            const result1 = await cloudinary.uploader.destroy(publicId);
        console.log ("RESULT 1: " , result1);
            if (result1.result === "not found") {
                return res.status(404).send("File not found in Cloudinary");
            }
            await pool.query("DELETE FROM article_images WHERE public_id = $1", [publicId]);
            upload.single("file")(req, res, async (err) => {
                if (err) {
                    return res.status(400).send(err.message)
                    }
                if (!req.file) {
                    return res.status(400).send("No file uploaded.")
                    }	
                const result = await cloudinary.uploader.upload(req.file.path,
                     { public_id: publicId})
                 fs.unlinkSync(req.file.path);
    
                console.log ("RESULT: " ,result);
                res.json({
                    message: "File updated successfully to Cloudinary",
                    url: result.secure_url,
                    public_id: result.public_id,
                    article_id: article_id
                })
                await pool.query("INSERT INTO article_images (public_id, article_id) VALUES ($1, $2)", [result.public_id, article_id]);
            })
            
            
        } catch (error) {
            res.status(500).send("Error updating from Cloudinary: " + error.message);
    }
}

module.exports = {
    getURLController,
    addPhotoController,
    deletePhotoController,
    updatePhotoController,
    upload
}