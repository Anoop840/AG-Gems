const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

// Get wishlist
router.get("/", protect, getWishlist);

// Add to wishlist
router.post("/add/:productId", protect, addToWishlist);

// Remove from wishlist
router.delete("/remove/:productId", protect, removeFromWishlist);

module.exports = router;
