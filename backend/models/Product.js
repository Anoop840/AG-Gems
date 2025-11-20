import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  cost: { type: Number, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  barcode: String,
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  subcategory: String,
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  material: { 
    type: String, 
    enum: ['gold', 'silver', 'platinum', 'diamond', 'gemstone', 'other'] 
  },
  metal: {
    type: { type: String, enum: ['gold', 'silver', 'platinum', 'none'] },
    purity: String, // e.g., "14K", "18K", "925"
    weight: Number // in grams
  },
  gemstones: [{
    type: String,
    carat: Number,
    clarity: String,
    color: String,
    cut: String
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  weight: { type: Number }, // in grams
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema);