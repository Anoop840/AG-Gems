"use client"

import { useState, useEffect, useMemo } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { productAPI, Product } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("featured")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Log API URL for debugging
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('Fetching products from:', `${apiUrl}/products`)
      
      const response = await productAPI.getProducts({
        limit: 1000, // Get all products (increased limit)
        sort: sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? '-price' : '-createdAt'
      })
      
      console.log('Products response:', response)
      
      if (response.success && response.products) {
        setProducts(response.products)
        if (response.products.length === 0) {
          setError('No products found in the database. Please run the seed script: "npm run seed" in the backend directory.')
        }
      } else {
        setError('Failed to load products. Please check your backend connection.')
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      const errorMsg = error.message || 'Unknown error'
      
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        setError('Cannot connect to backend API. Please make sure your backend server is running on http://localhost:5000')
      } else if (errorMsg.includes('404')) {
        setError('API endpoint not found. Please check your backend routes.')
      } else {
        setError(`Failed to fetch products: ${errorMsg}. Make sure products are seeded in the database.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = [...products] // Create a copy to avoid mutating original

    // Filter by category only
    if (selectedCategory) {
      filtered = filtered.filter((p) => 
        p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Sort products
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    }

    return filtered
  }, [products, selectedCategory, sortBy])

  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach(p => {
      if (p.category?.name) {
        cats.add(p.category.name)
      }
    })
    return Array.from(cats)
  }, [products])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

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
                {categories.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-foreground mb-3">Category</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategory === null}
                          onChange={() => setSelectedCategory(null)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-foreground">All Categories</span>
                      </label>
                      {categories.map((cat) => (
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
                )}


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
              {error ? (
                <div className="text-center py-12">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-destructive font-semibold mb-2">Error Loading Products</p>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <button
                      onClick={fetchProducts}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => {
                    const image = product.images?.find(img => img.isPrimary)?.url || 
                                 product.images?.[0]?.url || 
                                 '/placeholder.svg'
                    return (
                      <ProductCard
                        key={product._id}
                        id={product._id}
                        image={image}
                        title={product.name}
                        price={product.price}
                        category={product.category?.name || 'Jewelry'}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No products found matching your criteria</p>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
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
