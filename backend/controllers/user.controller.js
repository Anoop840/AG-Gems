const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Corrected path to use '../models/User'
const { protect } = require("../middleware/auth");

// Update profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    // IMPORTANT: Exclude walletAddress here, use a dedicated route for security
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- NEW ROUTE TO LINK WALLET ADDRESS ---
router.put("/link-wallet", protect, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Wallet address is required" });
    }

    // Check if the address is already linked to another user
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This wallet address is already linked to another account",
        });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
      message: "Wallet address linked successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove wallet address
router.put("/unlink-wallet", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress: null },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
      message: "Wallet address unlinked successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ---------------------------------------------

// Add address
router.post("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(req.body);
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update address
router.put("/addresses/:addressId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete address
router.delete("/addresses/:addressId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
