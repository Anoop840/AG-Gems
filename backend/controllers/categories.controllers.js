const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { protect, authorize } = require("../middleware/auth");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("parent", "name slug")
      .sort("order");

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single category
router.get("/:slug", async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("parent", "name slug");

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Get subcategories
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true,
    }).sort("order");

    res.json({ success: true, category, subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create category (Admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update category (Admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete category (Admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
