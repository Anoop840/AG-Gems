import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  lastModified: { type: Date, default: Date.now }
}, { timestamps: true });

cartSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);