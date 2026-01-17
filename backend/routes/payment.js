const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyCryptoPayment,
  getExchangeRate,
} = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth");

router.get("/exchange-rate", getExchangeRate);

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyRazorpayPayment);
router.post("/verify-crypto", protect, verifyCryptoPayment);

module.exports = router;
