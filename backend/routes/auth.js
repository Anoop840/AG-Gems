const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message:
      "Too many login attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/me", protect, getCurrentUser);

module.exports = router;
