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

router.put("/profile", protect, updateProfile);

router.put("/link-wallet", protect, linkWallet);
router.put("/unlink-wallet", protect, unlinkWallet);

router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

module.exports = router;
