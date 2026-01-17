const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

router.get("/", protect, getWishlist);

router.post("/add/:productId", protect, addToWishlist);

router.delete("/remove/:productId", protect, removeFromWishlist);

module.exports = router;
