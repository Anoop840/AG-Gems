const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getFeaturedProducts,
  getSearchSuggestions,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");
const { protect, authorize } = require("../middleware/auth");

// Public routes - Must be defined before /:id to avoid conflicts
router.get("/featured/list", getFeaturedProducts);
router.get("/search/suggestions", getSearchSuggestions);
router.get("/", getAllProducts);

// Admin only routes
router.post("/", protect, authorize("admin"), createProduct);

// Public routes with ID parameter
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

// Admin routes with ID parameter
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
