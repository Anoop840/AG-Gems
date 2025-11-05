"use client"

import { useState, useMemo } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"

const ALL_PRODUCTS = [
  { id: "1", image: "/gold-necklace.png", title: "Elegance Necklace", price: 45000, category: "necklaces" },
  { id: "2", image: "/sparkling-diamond-ring.png", title: "Timeless Ring", price: 65000, category: "rings" },
  { id: "3", image: "/pearl-earrings.png", title: "Pearl Earrings", price: 28000, category: "earrings" },
  { id: "4", image: "/gold-bracelet.png", title: "Royal Bracelet", price: 52000, category: "bracelets" },
  { id: "5", image: "/gold-necklace-luxury.jpg", title: "Divine Pendant", price: 55000, category: "necklaces" },
  { id: "6", image: "/solitaire-diamond-ring.png", title: "Eternal Promise", price: 85000, category: "rings" },
  { id: "7", image: "/chandelier-earrings.jpg", title: "Chandelier Drops", price: 35000, category: "earrings" },
  { id: "8", image: "/jewelled-bracelet.jpg", title: "Celestial Bangle", price: 48000, category: "bracelets" },
]

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState([20000, 90000])
  const [sortBy, setSortBy] = useState("featured")

  const filteredProducts = useMemo(() => {
    let products = ALL_PRODUCTS

    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory)
    }

    products = products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    if (sortBy === "price-low") {
      products.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      products.sort((a, b) => b.price - a.price)
    }

    return products
  }, [selectedCategory, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-2 text-foreground">Our Collections</h1>
          <p className="text-muted-foreground mb-8">Explore our curated selection of premium jewellery</p>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-secondary rounded-lg p-6 sticky top-32">
                <h3 className="font-display font-bold text-lg mb-6 text-foreground">Filters</h3>

                {/* Category Filter */}
                <div className="mb-8">
                  <h4 className="font-semibold text-foreground mb-3">Category</h4>
                  <div className="space-y-2">
                    {["necklaces", "rings", "earrings", "bracelets"].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat}
                          onChange={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-foreground capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-8">
                  <h4 className="font-semibold text-foreground mb-3">Price Range</h4>
                  <input
                    type="range"
                    min="20000"
                    max="90000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
