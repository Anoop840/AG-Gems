const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const { protect } = require("../middleware/auth");

// All cart routes are protected
router.use(protect);

// Cart routes
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update/:itemId", updateCartItem);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
