const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");
const {
  visionSearch,
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
} = require("../controllers/upload.controller");

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
