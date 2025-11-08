"use client"

import { useState } from "react"
import Script from "next/script"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { apiRequest, Order } from "@/lib/api" // You'll need to export `apiRequest` and the Order type from api.ts
import { useRouter } from "next/navigation"

// Define the response type from your backend's create-order route
interface RazorpayOrderResponse {
  success: boolean;
  orderId: string; // This is the Razorpay order ID
  amount: number;
  currency: string;
}

// Define the response type from your backend's payment verification route
interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [pinCode, setPinCode] = useState("")

  const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const shipping = subtotal > 50000 ? 0 : 500
  const tax = subtotal * 0.18 // 18% tax from backend logic
  const total = subtotal + shipping + tax
  
  // This is the main payment handler
  const handlePayment = async () => {
    if (!cart || !user) return;
    setLoading(true);

    try {
      // Step 1: Create the "pending" order in your database
      const shippingAddress = {
        fullName: `${firstName} ${lastName}`,
        email,
        addressLine1: address,
        city,
        zipCode: pinCode,
      };
      
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress,
        paymentMethod: 'card', // 'card' is in your enum
      };

      // You'll need to create this function in api.ts to POST to /api/orders
      const { order: dbOrder } = await apiRequest<{ success: boolean, order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      
      // Step 2: Create the Razorpay order using your backend
      const { orderId: razorpayOrderId, amount } = await apiRequest<RazorpayOrderResponse>('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: dbOrder.total, // Use the total from the created order
          orderId: dbOrder._id   // Pass your DB order ID as the receipt
        })
      });

      // Step 3: Open the Razorpay checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "AG Gems",
        description: `Order #${dbOrder.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          // Step 4: Verify the payment with your backend
          const data = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId: dbOrder._id
          };

          const verifyResponse = await apiRequest<VerifyPaymentResponse>('/payment/verify', {
            method: 'POST',
            body: JSON.stringify(data),
          });

          if (verifyResponse.success) {
            await refreshCart(); // Clear the cart
            router.push(`/order-confirmation?id=${dbOrder._id}`); // Redirect to a success page
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
        },
        theme: {
          color: "#3399cc"
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      alert(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
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
                    type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <input
                    type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <input
                    type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="sm:col-span-2 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <input
                    type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)}
                    className="sm:col-span-2 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <input
                    type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <input
                    type="text" placeholder="PIN Code" value={pinCode} onChange={(e) => setPinCode(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              {/* Payment (Removed the static radio buttons) */}
              <div className="bg-secondary rounded-lg p-6">
                <h2 className="font-display font-bold text-xl mb-6 text-foreground">Payment Method</h2>
                <p className="text-muted-foreground text-sm">You will be redirected to Razorpay to complete your payment securely.</p>
              </div>

              {/* Order Summary */}
              <div className="bg-secondary rounded-lg p-6">
                <h2 className="font-display font-bold text-xl mb-4 text-foreground">Order Summary</h2>
                <div className="space-y-2 pb-4 border-b border-border">
                  {cart?.items.map(item => (
                    <div key={item._id} className="flex justify-between text-foreground">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                   <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Shipping</span>
                      <span>₹{shipping.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Tax (18%)</span>
                      <span>₹{tax.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground mt-4 mb-6">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}