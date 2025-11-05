"use client"

import { useState } from "react"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { Heart, ShoppingCart, Star } from "lucide-react"

const PRODUCTS: Record<string, any> = {
  "1": {
    title: "Elegance Necklace",
    price: 45000,
    category: "Necklaces",
    image: "/gold-necklace.png",
    description: "A stunning gold necklace that exudes sophistication and elegance.",
    material: "18K Gold",
    weight: "12g",
    dimensions: "Length: 16 inches",
    rating: 4.8,
    reviews: 24,
  },
  "2": {
    title: "Timeless Ring",
    price: 65000,
    category: "Rings",
    image: "/sparkling-diamond-ring.png",
    description: "An exquisite diamond ring symbolizing eternal love and commitment.",
    material: "18K White Gold with Diamond",
    weight: "4g",
    dimensions: "Size: 6-12 (adjustable)",
    rating: 4.9,
    reviews: 42,
  },
}

const RELATED_PRODUCTS = [
  { id: "3", image: "/pearl-earrings.png", title: "Pearl Earrings", price: 28000, category: "Earrings" },
  { id: "4", image: "/gold-bracelet.png", title: "Royal Bracelet", price: 52000, category: "Bracelets" },
  { id: "5", image: "/gold-necklace-luxury.jpg", title: "Divine Pendant", price: 55000, category: "Necklaces" },
]

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const product = PRODUCTS[params.id] || PRODUCTS["1"]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-secondary rounded-lg h-96 lg:h-full min-h-96">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                width={600}
                height={600}
                className="object-contain"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <p className="text-primary font-semibold mb-2 text-sm uppercase tracking-widest">{product.category}</p>
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">{product.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-border"}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <p className="text-3xl font-bold text-primary mb-6">₹{product.price.toLocaleString()}</p>

              <p className="text-foreground mb-8 leading-relaxed">{product.description}</p>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Material</p>
                  <p className="font-semibold text-foreground">{product.material}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold text-foreground">{product.weight}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Dimensions</p>
                  <p className="font-semibold text-foreground">{product.dimensions}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-semibold text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors">
                  <Heart size={20} />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">Free shipping on orders above ₹50,000</p>
            </div>
          </div>

          {/* Related Products */}
          <div className="border-t border-border pt-16">
            <h2 className="font-display text-3xl font-bold mb-8 text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {RELATED_PRODUCTS.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
