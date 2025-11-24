// backend/routes/products.js
const express = require('express'); // Change: Use require for express
const router = express.Router();
// Change: Use require for model and middleware paths
const Product = require('../models/Product'); 
const { protect, authorize } = require('../middleware/auth'); 

// GET /api/products (Public/Filtered List)
router.get('/', async (req, res) => {
  try {
    // Extract query params from req.query (Express way)
    const { page = 1, limit = 12, category, minPrice, maxPrice, material, sort = '-createdAt', search, includeInactive } = req.query;

    const query = includeInactive === 'true' ? {} : { isActive: true };

    if (category) query.category = category;
    if (material) query.material = material;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      // Check if text indexing is enabled for the search query
      query.$text = { $search: search }; 
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Product.countDocuments(query);

    return res.json({ // Change: Use Express res.json()
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message }); // Change: Use Express res.status().json()
  }
});

// POST /api/products (Admin Only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.create(req.body); // Use req.body for Express
    
    return res.status(201).json({ success: true, product }); // Change: Use Express res.status().json()
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// New: Add GET by ID route (since it's common for Express CRUD)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// New: Add PUT/DELETE endpoints (needed for admin page functionality)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router; // Change: Use CommonJS export