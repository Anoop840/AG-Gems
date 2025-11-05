"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Trash2 } from "lucide-react"

export default function CartPage() {
  const cartItems = [
    { id: "1", title: "Elegance Necklace", price: 45000, quantity: 1, image: "/gold-necklace.png" },
    { id: "2", title: "Timeless Ring", price: 65000, quantity: 1, image: "/sparkling-diamond-ring.png" },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 500
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-12 text-foreground">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-secondary rounded-lg">
                    <div className="w-24 h-24 bg-background rounded-lg overflow-hidden flex-shrink-0">
                      {/* Image placeholder */}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-primary font-semibold mb-2">₹{item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 border border-border rounded hover:bg-background transition-colors">
                          −
                        </button>
                        <span className="px-3">{item.quantity}</span>
                        <button className="px-2 py-1 border border-border rounded hover:bg-background transition-colors">
                          +
                        </button>
                      </div>
                    </div>
                    <button className="text-destructive hover:text-destructive/80 transition-colors p-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
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
                    <span>₹{shipping}</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold text-foreground mb-6 mt-6">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full block text-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="w-full block text-center mt-3 text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
