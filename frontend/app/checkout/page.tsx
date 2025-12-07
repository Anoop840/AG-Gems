"use client"
import { useState, useEffect } from "react"
import Script from "next/script"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { useWallet } from "@/context/WalletConnect"
import { apiRequest,paymentAPI, Order, VerifyPaymentResponse, RazorpayOrderResponse, ExchangeRateResponse } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Wallet, Loader2, DollarSign, Bitcoin} from "lucide-react"
import { Button } from '@/components/ui/button';
import { ethers } from "ethers"
// --- CRYPTO CONFIG ---

// The central wallet address where ALL commerce crypto payments should be sent (your control)
// ⚠️ IMPORTANT: REPLACE THIS WITH YOUR REAL WALLET ADDRESS (Sepolia for testing)
const COMMERCE_WALLET_ADDRESS = '0x4ac629a6a526e9f6a7d1bf057c40be1e2589a94d'; 
// NOTE: Use your Sepolia testnet address here, as instructed in previous steps.

interface CryptoPaymentOption {
    symbol: string;
    name: string;
    address: string | null; // Null for native ETH
    decimals: number;
    mockInrToUnitRate: number; // Mocked rate for demonstration
    abi: string[] | null;
}

const CRYPTO_OPTIONS: { [key: string]: CryptoPaymentOption } = {
    ETH: {
        symbol: 'ETH',
        name: 'Ethereum',
        address: null,
        decimals: 18,
        // Mock rate: 1 INR = 0.0000030 ETH
        mockInrToUnitRate: 0.0000030, 
        abi: null,
    },
    USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        // Official USDC address on Ethereum Mainnet. Use the appropriate testnet address if targeting Sepolia.
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a9AaF631E7dc',
        decimals: 6,
        // Mock rate: 1 USD = 83 INR, so 1 INR = 0.012 USD
        mockInrToUnitRate: 0.012, 
        abi: [
            "function transfer(address to, uint256 amount) returns (bool)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ],
    },
    // You could add BTC via Wrapped BTC or USDT here following the USDC pattern
};

// --- INTERFACE DEFINITIONS (Moved here to avoid collision) ---
interface RazorpayOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}
// -----------------------------------------------------------------

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart()
  const { user } = useAuth()
  const { provider, account, isConnected, connectWallet } = useWallet()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card') // 'card' is Razorpay
  const [exchangeRate, setExchangeRate] = useState(CRYPTO_OPTIONS.ETH.mockInrToUnitRate) // Mock INR/ETH rate
  const [rateLoading, setRateLoading] = useState(true) // <-- FIXED REFERENCE ERROR
  const [rateError, setRateError] = useState<string | null>(null) // <-- FIXED REFERENCE ERROR
  // 🛠️ FIX C: Declare missing form state variables
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [pinCode, setPinCode] = useState("")

  const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const shipping = subtotal > 50000 ? 0 : 500
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax
  // Calculate ETH equivalent
  const ethAmount = total * exchangeRate;

  useEffect(() => {
    async function fetchRate() {
      try {
        setRateLoading(true)
        const response: ExchangeRateResponse = await paymentAPI.getEthExchangeRate()
        if (response.success) {
            setExchangeRate(response.inrToEthRate)
            setRateError(null)
        } else {
            setRateError('Failed to get real-time ETH rate.')
            // Fallback to mock rate
            setExchangeRate(CRYPTO_OPTIONS.ETH.mockInrToUnitRate) 
        }
      } catch (err: any) {
        setRateError(err.message || 'Error fetching rate.')
        // Fallback to mock rate
        setExchangeRate(CRYPTO_OPTIONS.ETH.mockInrToUnitRate)
      } finally {
        setRateLoading(false)
      }
    }
    fetchRate()
  }, [])

  // --- CONTRACT DETAILS (FOR REFERENCE/FUTURE USDC USE) ---
  const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a9AaF631E7dc';
  const USDC_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];
  // --------------------------------------------------------

  // 🛠️ FIX B: Consolidated Crypto Payment Handler (ETH logic retained)
  const handleCryptoPayment = async (dbOrder: Order) => {
    if (!isConnected || !account || !provider) {
      // setLoading(false) is intentionally missing here, handled below
      alert('Please connect your Ethereum wallet to proceed.');
      return;
    }
    setLoading(true);

    try {
      // --- On-chain Logic for ETH Payment ---

      // IMPORTANT: Replace with your actual ETH wallet address
      const recipientAddress = '0x4ac629a6a526e9f6a7d1bf057c40be1e2589a94d';

      // Convert ETH amount to BigNumber (wei)
      // NOTE: This uses 'ethAmount' calculated from INR total via mock rate
      const amountInWei = ethers.parseEther(ethAmount.toFixed(8));

      // Create a transaction object
      const tx = {
        to: recipientAddress,
        value: amountInWei,
      };

      // Get the signer and send the transaction
      const signer = await provider.getSigner();
      const txResponse = await signer.sendTransaction(tx);

      // Log or toast the transaction hash
      console.log(`Transaction Sent: ${txResponse.hash}`);

      // Wait for the transaction to be mined
      await txResponse.wait();

      // Step 4: Verify the payment and confirm order status on the backend
      const verifyResponse = await apiRequest<VerifyPaymentResponse>('/payment/verify-crypto', {
        method: 'POST',
        body: JSON.stringify({
          orderId: dbOrder._id,
          txHash: txResponse.hash,
          amountPaid: ethAmount.toFixed(8),
          currency: 'ETH',
        }),
      });

      if (verifyResponse.success) {
        await refreshCart();
        router.push(`/order-confirmation?id=${dbOrder._id}`);
      } else {
        alert('Crypto payment verification failed. Please contact support.');
      }

    } catch (err: any) {
      console.error("Crypto payment failed:", err);
      if (err.code === 4001) {
        alert('Transaction rejected by user (MetaMask).');
      } else {
        alert(err.message || 'Crypto payment failed. See console for details.');
      }
    } finally {
      setLoading(false);
    }
  }

  // This is the master handler
  const handleCheckout = async () => {
    if (!cart || !user) return;

    // Basic form validation 
    if (!firstName || !lastName || !email || !address || !city || !pinCode) {
      alert('Please fill in all shipping details.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the "pending" order in your database (This function also clears the cart)
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
        paymentMethod: paymentMethod, // Use selected method
      };

      const { order: dbOrder } = await apiRequest<{ success: boolean, order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (paymentMethod === 'card') {
        // EXISTING RAZORPAY LOGIC START
        const { orderId: razorpayOrderId, amount } = await apiRequest<RazorpayOrderResponse>('/payment/create-order', {
          method: 'POST',
          body: JSON.stringify({
            amount: dbOrder.total,
            orderId: dbOrder._id
          })
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount,
          currency: "INR",
          name: "AG Gems",
          description: `Order #${dbOrder.orderNumber}`,
          order_id: razorpayOrderId,
          handler: async function (response: any) {
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
              await refreshCart();
              router.push(`/order-confirmation?id=${dbOrder._id}`);
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
        // Set loading to false only after the Razorpay modal is handled in its handler
        setLoading(false); 

      } else if (paymentMethod === 'wallet') {
        // NEW CRYPTO LOGIC
        // handleCryptoPayment handles its own internal loading state
        await handleCryptoPayment(dbOrder);
      }

    } catch (err: any) {
      alert(err.message || "An error occurred. Please try again.");
    } finally {
      // Final fallback to ensure loading stops if an early error occurs
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
              {/* Payment Method Selection */}
              <div className="bg-secondary rounded-lg p-6">
                <h2 className="font-display font-bold text-xl mb-6 text-foreground">Payment Method</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4 rounded-full border-border text-primary focus:ring-primary"
                      disabled={loading}
                    />
                    <span className="text-foreground">Card / UPI (via Razorpay)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="w-4 h-4 rounded-full border-border text-primary focus:ring-primary"
                      disabled={loading}
                    />
                    <span className="text-foreground flex items-center gap-2">
                      Crypto Wallet <Wallet size={16} className="text-foreground/80" /> (ETH, USDC, etc.)
                    </span>
                  </label>
                </div>
                {paymentMethod === 'wallet' && (
                  <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                    {rateLoading ? (
                        <div className="flex items-center text-primary">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <p className="text-sm">Fetching real-time ETH rate...</p>
                        </div>
                    ) : rateError ? (
                        <p className="text-sm text-destructive">
                            Rate Error: {rateError}. Using fallback rate.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            You will pay <span className="font-semibold text-foreground">
                                {ethAmount.toFixed(8)} ETH
                            </span> (approx. ₹{total.toLocaleString()}) from your connected wallet.
                            <br/>
                            <span className='text-xs text-green-600'>Live rate applied.</span>
                        </p>
                    )}
                    {!isConnected && (
                      <Button variant="outline" size="sm" onClick={connectWallet} className="mt-3">
                        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                      </Button>
                    )}
                  </div>
                )}
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
                  onClick={handleCheckout}
                  disabled={loading || (paymentMethod === 'wallet' && !isConnected)}
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