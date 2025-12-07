// frontend/app/wishlist/page.tsx
'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import ProductCard from "@/components/product-card"
import { wishlistAPI, Product } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchWishlist()
    
    // Listen for global event triggered by ProductCard/ProductPage removal
    const handleWishlistUpdate = () => {
      fetchWishlist()
    }
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
    }
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await wishlistAPI.getWishlist()
      if (response.success) {
        setWishlist(response.wishlist)
      } else {
        setError("Failed to fetch wishlist.")
      }
    } catch (err: any) {
      console.error("Wishlist Fetch Error:", err)
      setError(err.message || 'An error occurred while loading your wishlist.')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    if (error) {
        return <p className="text-destructive p-4 text-center">{error}</p>;
    }
    
    if (wishlist.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-muted-foreground fill-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-semibold text-2xl">Your Wishlist is Empty</h3>
          <p className="text-muted-foreground">Tap the heart icon on any product to save it here.</p>
          <Button asChild className="mt-6">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {wishlist.map((product) => {
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
              initialIsFavorited={true} // Since it's on the wishlist page
            />
          )
        })}
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-8 text-foreground">My Wishlist ({wishlist.length})</h1>
            
            <div className="min-h-[40vh]">
              {renderContent()}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}