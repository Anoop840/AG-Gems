const express = require("express");
const router = express.Router();

const { createReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// POST /api/reviews
router.post("/", protect, createReview);

module.exports = router;
