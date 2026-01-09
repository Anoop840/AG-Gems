const Review = require("../models/Review");
const Product = require("../models/Product");

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const user = req.user; // attached by protect middleware
    const { product, rating, title, comment, images } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: user._id,
      product,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      user: user._id,
      product,
      rating,
      title,
      comment,
      images,
    });

    // Recalculate average rating (approved reviews only)
    const reviews = await Review.find({ product, isApproved: true });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : rating;

    await Product.findByIdAndUpdate(product, {
      rating: avgRating,
      reviewCount: reviews.length,
    });

    return res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
};
