"use client"

import { useState, useEffect, Suspense } from "react" // Added Suspense
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/ProtectedRoute"
import { orderAPI, Order } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Package, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// 1. Move the logic into a sub-component
function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId)
    } else {
      setError("No order ID provided.")
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await orderAPI.getOrder(id)
      if (response.success && response.order) {
        setOrder(response.order)
      } else {
        setError("Order not found or you are not authorized to view it.")
      }
    } catch (err: any) {
      console.error("Error fetching order:", err)
      setError(err.message || "Failed to load order details.")
      toast({
        title: 'Error',
        description: err.message || 'Failed to load order details.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStatusBadge = (status: string) => {
    let colorClass = "bg-secondary text-secondary-foreground"
    if (status === 'confirmed' || status === 'delivered') {
      colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    } else if (status === 'cancelled') {
      colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colorClass}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-4">Order Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-6">No order details available.</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 bg-secondary p-8 rounded-xl shadow-lg">
        <CheckCircle className="size-16 text-primary mx-auto mb-4" />
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground">Thank you for your purchase.</p>
        <div className="mt-4 flex flex-wrap gap-4 items-center justify-center">
          <h2 className="font-semibold text-xl text-foreground">Order #{order.orderNumber}</h2>
          {renderStatusBadge(order.orderStatus)}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-secondary p-6 rounded-lg shadow-sm">
            <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="size-6 text-primary" />
              Items Purchased
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0">
                  <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-foreground self-center">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary p-6 rounded-lg shadow-sm">
            <h3 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="size-6 text-primary" />
              Shipping Details
            </h3>
            <address className="not-italic text-foreground space-y-1">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-sm text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
            </address>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-secondary p-6 rounded-lg sticky top-32 shadow-lg">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">Payment Summary</h3>
            <div className="space-y-3 pb-6 border-b border-border">
              <div className="flex justify-between text-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Tax ({order.tax > 0 ? ((order.tax / order.subtotal) * 100).toFixed(0) : 0}%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground mt-4 mb-6">
              <span>Order Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-2">Payment Status:</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
              {order.paymentStatus}
            </span>
            <Button asChild className="w-full mt-6">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. Wrap the sub-component in Suspense
export default function OrderConfirmationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          }>
            <OrderConfirmationContent />
          </Suspense>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}