const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { protect, authorize } = require("../middleware/auth");
const axios = require("axios");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  },
});

router.post("/vision-search", async (req, res) => {
  try {
    // 1. Image is uploaded to Cloudinary via your existing middleware
    // 2. Send image URL to Vision API (Example using a placeholder logic)
    const imageUrl = req.body.imageUrl;

    if (!imageUrl) return res.status(400).json({ msg: "No image provided" });

    // Placeholder: In a real scenario, you would send imageUrl to a Vision API
    // and receive labels like ['ring', 'gold']
    const mockDetectedLabels = ["diamond", "ring"];

    // 3. Search DB based on AI labels
    const results = await Product.find({
      $or: [
        { name: { $regex: detectedLabels[0], $options: "i" } },
        { description: { $regex: detectedLabels[1], $options: "i" } },
      ],
    }).limit(10);

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Visual search failed" });
  }
});
// Upload single image
router.post(
  "/image",
  protect,
  authorize("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "jewelry-store" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Upload multiple images
router.post(
  "/images",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "jewelry-store" },
            (error, result) => {
              if (error) reject(error);
              else
                resolve({
                  url: result.secure_url,
                  publicId: result.public_id,
                });
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const images = await Promise.all(uploadPromises);

      res.json({ success: true, images });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Delete image
router.delete(
  "/image/:publicId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const publicId = req.params.publicId.replace(/-/g, "/");
      await cloudinary.uploader.destroy(publicId);

      res.json({ success: true, message: "Image deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
