const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// @desc    Vision-based product search
// @route   POST /api/upload/vision-search
// @access  Public
const visionSearch = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Placeholder for Vision API response
    const detectedLabels = ["diamond", "ring"];

    const results = await Product.find({
      $or: [
        { name: { $regex: detectedLabels[0], $options: "i" } },
        { description: { $regex: detectedLabels[1], $options: "i" } },
      ],
    }).limit(10);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Visual search failed" });
  }
};

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Admin
const uploadSingleImage = async (req, res) => {
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
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Admin
const uploadMultipleImages = async (req, res) => {
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
};

// @desc    Delete image
// @route   DELETE /api/upload/image/:publicId
// @access  Admin
const deleteImage = async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/-/g, "/");
    await cloudinary.uploader.destroy(publicId);

    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  visionSearch,
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
};
