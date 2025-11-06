const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-store');

const categories = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Beautiful rings for every occasion',
    order: 1
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Elegant necklaces and pendants',
    order: 2
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earrings collection',
    order: 3
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Charming bracelets and bangles',
    order: 4
  },
  {
    name: 'Anklets',
    slug: 'anklets',
    description: 'Graceful anklets',
    order: 5
  }
];

// Map categories to available product images
const categoryImages = {
  'Rings': ['/sparkling-diamond-ring.png', '/solitaire-diamond-ring.png'],
  'Necklaces': ['/gold-necklace.png', '/gold-necklace-luxury.jpg'],
  'Earrings': ['/pearl-earrings.png', '/chandelier-earrings.jpg'],
  'Bracelets': ['/gold-bracelet.png', '/jewelled-bracelet.jpg'],
  'Anklets': ['/gold-bracelet.png'] // Using bracelet image as placeholder for anklets
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log('Database cleared');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created');

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@jewelry.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    console.log('Admin user created');

    // Create sample products
    const products = [];
    for (let i = 0; i < 20; i++) {
      const category = createdCategories[i % createdCategories.length];
      const categoryName = category.name;
      
      // Get images for this category
      const availableImages = categoryImages[categoryName] || ['/placeholder.svg'];
      // Cycle through available images for this category
      const imageIndex = Math.floor(i / createdCategories.length) % availableImages.length;
      const productImage = availableImages[imageIndex];
      
      products.push({
        name: `${categoryName.slice(0, -1)} ${i + 1}`,
        description: `Beautiful ${categoryName.toLowerCase()} with exquisite design. Perfect for special occasions and daily wear.`,
        shortDescription: `Elegant ${categoryName.toLowerCase()} piece`,
        price: Math.floor(Math.random() * 50000) + 5000,
        compareAtPrice: Math.floor(Math.random() * 60000) + 10000,
        category: category._id,
        material: ['gold', 'silver', 'platinum', 'diamond'][Math.floor(Math.random() * 4)],
        metal: {
          type: ['gold', 'silver', 'platinum'][Math.floor(Math.random() * 3)],
          purity: ['14K', '18K', '22K', '925'][Math.floor(Math.random() * 4)],
          weight: Math.random() * 10 + 2
        },
        stock: Math.floor(Math.random() * 50) + 10,
        images: [{
          url: productImage,
          alt: `${categoryName.slice(0, -1)} ${i + 1}`,
          isPrimary: true
        }],
        tags: ['new', 'trending', 'bestseller'][Math.floor(Math.random() * 3)],
        isFeatured: Math.random() > 0.5,
        isActive: true
      });
    }

    await Product.insertMany(products);
    console.log('Sample products created');

    console.log('Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@jewelry.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
