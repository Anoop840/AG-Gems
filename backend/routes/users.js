const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  updateProfile,
  linkWallet,
  unlinkWallet,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/user.controller");

// Profile
router.put("/profile", protect, updateProfile);

// Wallet
router.put("/link-wallet", protect, linkWallet);
router.put("/unlink-wallet", protect, unlinkWallet);

// Addresses
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

module.exports = router;
