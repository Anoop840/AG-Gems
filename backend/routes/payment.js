const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyCryptoPayment,
  getExchangeRate,
} = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/exchange-rate", getExchangeRate);

// Protected routes
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyRazorpayPayment);
router.post("/verify-crypto", protect, verifyCryptoPayment);

module.exports = router;
