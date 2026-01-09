const express = require("express");
const router = express.Router();
const multer = require("multer");

const { protect, authorize } = require("../middleware/auth");
const {
  visionSearch,
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
} = require("../controllers/uploadController");

// Multer configuration
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

// Vision search
router.post("/vision-search", visionSearch);

// Upload single image
router.post(
  "/image",
  protect,
  authorize("admin"),
  upload.single("image"),
  uploadSingleImage
);

// Upload multiple images
router.post(
  "/images",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  uploadMultipleImages
);

// Delete image
router.delete("/image/:publicId", protect, authorize("admin"), deleteImage);

module.exports = router;
