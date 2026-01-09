const express = require("express");
const router = express.Router();

const { createReview } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth");

// POST /api/reviews
router.post("/", protect, createReview);

module.exports = router;
