const User = require("../models/User");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Link wallet address
// @route   PUT /api/users/link-wallet
// @access  Private
const linkWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Wallet address is required" });
    }

    const existingUser = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({
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
};

// @desc    Unlink wallet address
// @route   PUT /api/users/unlink-wallet
// @access  Private
const unlinkWallet = async (req, res) => {
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
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
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
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = async (req, res) => {
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
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
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
};

module.exports = {
  updateProfile,
  linkWallet,
  unlinkWallet,
  addAddress,
  updateAddress,
  deleteAddress,
};
