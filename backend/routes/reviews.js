import connectDB from '@/server/db';
import Review from '@/server/models/Review';
import Product from '@/server/models/Product';
import { protect } from '@/server/middleware/auth';
import { NextResponse } from 'next/server';

connectDB();

export async function POST(req) {
  try {
    const userOrResponse = await protect(req);
    if (userOrResponse instanceof Response) return userOrResponse;
    const user = userOrResponse;

    const { product, rating, title, comment, images } = await req.json();

    // Check if user already reviewed
    const existingReview = await Review.findOne({ 
      user: user._id, 
      product 
    });

    if (existingReview) {
      return NextResponse.json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      }, { status: 400 });
    }

    const review = await Review.create({
      user: user._id,
      product,
      rating,
      title,
      comment,
      images
    });

    // Update product rating
    const reviews = await Review.find({ product, isApproved: true });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : rating; // If this is the first review (and not yet approved), it won't affect rating until approved, or maybe logic differs. 
      // The original code updated rating immediately based on approved reviews. 
      // If this new review is not approved yet, it shouldn't affect rating.
      // But the original code fetched approved reviews. So if this one is not approved (default false), it won't be included.
      // Wait, if default isApproved is false, then reviews.length might be 0.
      // Let's stick to original logic.

    await Product.findByIdAndUpdate(product, {
      rating: avgRating,
      reviewCount: reviews.length
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
