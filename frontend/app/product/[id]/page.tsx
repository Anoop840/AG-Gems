"use client"

import { useState, useEffect,useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { Heart, ShoppingCart, Star, Loader2 } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { productAPI, Product, wishlistAPI,WishlistResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  // --- WISHLIST FETCH AND TOGGLE LOGIC ---
  const checkIsFavorited = useCallback(async () => {
    if (!isAuthenticated || !productId) {
      setIsFavorited(false)
      return
    }
    try {
      const response: WishlistResponse = await wishlistAPI.getWishlist()
      const isFav = response.wishlist.some(p => p._id === productId)
      setIsFavorited(isFav)
    } catch (error) {
      // Silently fail if wishlist API fails (e.g., if token is expired)
    }
  }, [isAuthenticated, productId])
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Sign In Required', description: 'Please log in to manage your wishlist.', variant: 'destructive' })
      router.push('/login')
      return
    }

    try {
      if (isFavorited) {
        await wishlistAPI.removeFromWishlist(productId)
        toast({ title: "Removed from Wishlist", description: `${product?.name} removed.` })
      } else {
        await wishlistAPI.addToWishlist(productId)
        toast({ title: "Added to Wishlist", description: `${product?.name} added.` })
      }
      setIsFavorited(prev => !prev)
      window.dispatchEvent(new CustomEvent('wishlistUpdated')) 

    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update wishlist.', variant: 'destructive' })
    }
  }
  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchRelatedProducts()
    }
  }, [productId])
  useEffect(() => {
    if (!loading && productId) {
      checkIsFavorited()
    }
  }, [loading, productId, checkIsFavorited, isAuthenticated])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProduct(productId)
      if (response.success && response.product) {
        setProduct(response.product)
      } else {
        toast({
          title: 'Error',
          description: 'Product not found',
          variant: 'destructive',
        })
        router.push('/shop')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load product',
        variant: 'destructive',
      })
      router.push('/shop')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const response = await productAPI.getFeaturedProducts()
      if (response.success && response.products) {
        // Filter out current product and limit to 3
        const filtered = response.products
          .filter(p => p._id !== productId)
          .slice(0, 3)
        setRelatedProducts(filtered)
      }
    } catch (error) {
      // Silently fail for related products
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add items to cart',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }

    if (!product) return

    setIsAddingToCart(true)
    try {
      await addToCart(product._id, quantity)
    } catch (error: any) {
      // Error is already handled in cart context, but we can add more specific handling here
      if (error.message.includes('Product not found')) {
        toast({
          title: 'Product not available',
          description: 'This product is no longer available',
          variant: 'destructive',
        })
      } else if (error.message.includes('Insufficient stock')) {
        toast({
          title: 'Out of stock',
          description: 'Not enough stock available',
          variant: 'destructive',
        })
      }
    } finally {
      setIsAddingToCart(false)
    }
  }

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

  if (!product) {
    return null
  }

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || 
                       product.images?.[0]?.url || 
                       '/placeholder.svg'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* ... (Image and Info sections remain the same) ... */}
            
            {/* Actions */}
            {product.stock > 0 && (
              <>
                <div className="flex gap-4 mb-6">
                {/* ... (Quantity controls remain the same) ... */}
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-semibold text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || quantity > product.stock}
                    className="flex-1"
                  >
                  {/* ... (Add to Cart button remains the same) ... */}
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} className="mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  {/* --- WISHLIST BUTTON UPDATE --- */}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="px-6"
                    onClick={handleToggleFavorite} // <-- Use new handler
                  >
                    <Heart size={20} className={isFavorited ? "fill-primary text-primary" : "text-foreground"} />
                  </Button>
                  {/* ------------------------------- */}
                </div>
              </>
            )}

            <p className="text-sm text-muted-foreground mt-6">Free shipping on orders above ₹50,000</p>
          </div>
        </div>

        {/* Related Products - remains the same */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-border pt-16">
            <h2 className="font-display text-3xl font-bold mb-8 text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((product) => {
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
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
