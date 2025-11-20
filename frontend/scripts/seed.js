import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../server/models/Product.js';
import Category from '../server/models/Category.js';
import User from '../server/models/User.js';

dotenv.config();

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

const ADMIN_EMAIL = 'admin@jewelry.com';

const seedDatabase = async () => {
  try {
    const shouldReset = process.argv.includes('--reset');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelry-store';

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    if (shouldReset) {
      await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        User.deleteMany({})
      ]);
      console.log('Existing data cleared (--reset mode)');
    } else {
      console.log('Safe mode: existing data will be preserved');
    }

    // Upsert default categories without removing custom ones
    await Category.bulkWrite(
      categories.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          update: { $set: category },
          upsert: true
        }
      }))
    );
    const ensuredCategories = await Category.find({
      slug: { $in: categories.map((category) => category.slug) }
    }).sort({ order: 1 });

    if (!ensuredCategories.length) {
      throw new Error('Default categories could not be ensured');
    }
    console.log('Categories ensured');

    // Ensure admin user exists without wiping other users
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (!adminUser) {
      adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: ADMIN_EMAIL,
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created');
    } else {
      let adminUpdated = false;

      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        adminUpdated = true;
      }

      if (!adminUser.isVerified) {
        adminUser.isVerified = true;
        adminUpdated = true;
      }

      if (adminUpdated) {
        await adminUser.save();
        console.log('Admin user updated');
      } else {
        console.log('Admin user already exists');
      }
    }

    const existingProductCount = shouldReset ? 0 : await Product.estimatedDocumentCount();
    const shouldSeedProducts = shouldReset || existingProductCount === 0;

    if (shouldSeedProducts) {
      const products = [];

      for (let i = 0; i < 20; i++) {
        const category = ensuredCategories[i % ensuredCategories.length];
        const categoryName = category.name;
        const singularName = categoryName.endsWith('s')
          ? categoryName.slice(0, -1)
          : categoryName;

        const availableImages = categoryImages[categoryName] || ['/placeholder.svg'];
        const imageIndex = Math.floor(i / ensuredCategories.length) % availableImages.length;
        const productImage = availableImages[imageIndex];

        products.push({
          name: `${singularName} ${i + 1}`,
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
          images: [
            {
              url: productImage,
              alt: `${singularName} ${i + 1}`,
              isPrimary: true
            }
          ],
          tags: ['new', 'trending', 'bestseller'][Math.floor(Math.random() * 3)],
          isFeatured: Math.random() > 0.5,
          isActive: true
        });
      }

      if (products.length) {
        await Product.insertMany(products);
        console.log('Sample products created');
      }
    } else {
      console.log('Products already exist; skipping sample product creation');
    }

    console.log('Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@jewelry.com');
    console.log('Password: admin123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();