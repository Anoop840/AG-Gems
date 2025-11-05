"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-12 text-foreground">Checkout</h1>

          <div className="grid gap-8">
            {/* Shipping Address */}
            <div className="bg-secondary rounded-lg p-6">
              <h2 className="font-display font-bold text-xl mb-6 text-foreground">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="sm:col-span-2 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="sm:col-span-2 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                <input
                  type="text"
                  placeholder="City"
                  className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-secondary rounded-lg p-6">
              <h2 className="font-display font-bold text-xl mb-6 text-foreground">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                  <input type="radio" name="payment" defaultChecked className="w-4 h-4" />
                  <span className="text-foreground font-semibold">Credit/Debit Card</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4" />
                  <span className="text-foreground font-semibold">UPI</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
                  <input type="radio" name="payment" className="w-4 h-4" />
                  <span className="text-foreground font-semibold">Net Banking</span>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-secondary rounded-lg p-6">
              <h2 className="font-display font-bold text-xl mb-4 text-foreground">Order Summary</h2>
              <div className="space-y-2 pb-4 border-b border-border">
                <div className="flex justify-between text-foreground">
                  <span>Elegance Necklace × 1</span>
                  <span>₹45,000</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Timeless Ring × 1</span>
                  <span>₹65,000</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold text-foreground mt-4 mb-6">
                <span>Total</span>
                <span>₹110,500</span>
              </div>
              <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Complete Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
