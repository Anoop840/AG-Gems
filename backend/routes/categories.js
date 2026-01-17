const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories.controllers");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
