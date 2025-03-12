const express = require("express");
const router = express.Router();
const photoController = require("../controllers/photo-controller.js");
require("dotenv").config()
const multer = require("multer")
const fs = require("fs")
const cloudinary = require("cloudinary").v2

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
    api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
})

// Constants for file validation
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// Error handling middleware
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res
                .status(400)
                .send(
                    `File size too large. Maximum size is ${
                        MAX_FILE_SIZE / 1024 / 1024
                    }MB`
                )
        }
    }
    res.status(400).send(err.message)
})
//router.get("/", photoController.getAllPhotos); 
router.get("/get-url", photoController.getURLController); //Get URL from public_id
router.post("/upload-to-cloud/:article_id", photoController.upload.array("file"), photoController.addPhotoController); // Upload to Cloudinary
router.delete("/delete-image/:public_id", photoController.deletePhotoController); // Delete from Cloudinary
router.put("/update-image/:public_id", photoController.updatePhotoController); // Update from Cloudinary

module.exports = router;