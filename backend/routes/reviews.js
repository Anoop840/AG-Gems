// backend/routes/reviews.js
const express = require('express'); // Change: Use require for express
const router = express.Router();
// Change: Use require for model and middleware paths
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// POST /api/reviews - Create a new review
router.post('/', protect, async (req, res) => {
  try {
    const user = req.user; // User is attached by the Express middleware 'protect'
    const { product, rating, title, comment, images } = req.body;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ 
      user: user._id, 
      product 
    });

    if (existingReview) {
      return res.status(400).json({ // Change: Use Express res.status().json()
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    const review = await Review.create({
      user: user._id,
      product,
      rating,
      title,
      comment,
      images
    });

    // Update product rating (Logic preserved from original file)
    const reviews = await Review.find({ product, isApproved: true });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : rating; 

    await Product.findByIdAndUpdate(product, {
      rating: avgRating,
      reviewCount: reviews.length
    });

    return res.status(201).json({ success: true, review }); // Change: Use Express res.status().json()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; // Change: Use CommonJS export