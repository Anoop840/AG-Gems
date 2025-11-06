"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Trash2, ShoppingBag } from "lucide-react"
import { CartItem } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { Button } from "@/components/ui/button"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function CartPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { cart, loading: cartLoading, updateQuantity, removeFromCart } = useCart()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const cartItems = cart?.items || []

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await updateQuantity(itemId, newQuantity)
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    try {
      await removeFromCart(itemId)
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 50000 ? 0 : 500
  const total = subtotal + shipping

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display text-4xl font-bold mb-12 text-foreground">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2 text-foreground">Your cart is empty</h2>
                <p className="text-muted-foreground mb-8">Start shopping to add items to your cart</p>
                <Button asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const isUpdating = updatingItems.has(item._id)
                      // Get image URL from the images array (which contains objects with url property)
                      const primaryImage = item.product.images?.find(img => img.isPrimary)?.url || 
                                          item.product.images?.[0]?.url || 
                                          '/placeholder.svg'
                      
                      return (
                        <div key={item._id} className="flex gap-4 p-4 bg-secondary rounded-lg">
                          <div className="w-24 h-24 bg-background rounded-lg overflow-hidden flex-shrink-0 relative">
                            <Image
                              src={primaryImage}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{item.product.name}</h3>
                            <p className="text-primary font-semibold mb-2">₹{item.price.toLocaleString()}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="px-2 py-1 border border-border rounded hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                −
                              </button>
                              <span className="px-3">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                disabled={isUpdating || item.quantity >= item.product.stock}
                                className="px-2 py-1 border border-border rounded hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={isUpdating}
                            className="text-destructive hover:text-destructive/80 transition-colors p-2 disabled:opacity-50"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-secondary rounded-lg p-6 sticky top-32">
                    <h2 className="font-display font-bold text-lg mb-6 text-foreground">Order Summary</h2>

                    <div className="space-y-4 pb-6 border-b border-border">
                      <div className="flex justify-between text-foreground">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-foreground">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold text-foreground mb-6 mt-6">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>

                    {subtotal < 50000 && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Add ₹{(50000 - subtotal).toLocaleString()} more for free shipping
                      </p>
                    )}

                    <Button asChild className="w-full mb-3">
                      <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>

                    <Button variant="outline" asChild className="w-full">
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
