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

router.get("/featured/list", getFeaturedProducts);
router.get("/search/suggestions", getSearchSuggestions);
router.get("/", getAllProducts);

router.post("/", protect, authorize("admin"), createProduct);

router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
