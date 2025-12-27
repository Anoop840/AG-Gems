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

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="py-8 text-center">
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
              Our Collection
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Explore our exquisite selection of handcrafted gemstone jewelry.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Links */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Categories</h3>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-left ${!selectedCategory ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left ${selectedCategory === cat ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Sorting and Info */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} products
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive font-semibold">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
