const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");
const axios = require("axios");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Create Razorpay order
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: orderId,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// --- NEW CRYPTO VERIFY ROUTE ---
router.post("/verify-crypto", protect, async (req, res) => {
  try {
    // These values are sent from the frontend after the wallet transaction is complete
    const { orderId, txHash, amountPaid, currency } = req.body;

    if (!txHash || !orderId || !amountPaid || !currency) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment details" });
    }

    console.log(
      `Verifying Crypto TX: ${txHash} for Order: ${orderId} (${amountPaid} ${currency})`
    );

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if the payment method is intended for crypto
    if (order.paymentMethod !== "wallet") {
      return res.status(400).json({
        success: false,
        message: "Order not configured for crypto payment",
      });
    }

    // --- CRITICAL: REAL BLOCKCHAIN VERIFICATION NEEDED HERE ---

    // ⚠️ WARNING: The code below is a MOCK implementation for demo only!
    // ⚠️ DO NOT USE IN PRODUCTION WITHOUT IMPLEMENTING REAL BLOCKCHAIN VERIFICATION.

    // 1. Initialize Ethers Provider (Requires installing 'ethers' on the backend: npm install ethers)
    /*
    const provider = new providers.JsonRpcProvider(process.env.ETH_RPC_URL || MOCK_ETH_RPC_URL);
    const txReceipt = await provider.waitForTransaction(txHash);
    
    if (!txReceipt || txReceipt.status !== 1) {
      return res.status(400).json({ success: false, message: 'Blockchain transaction failed or not found' });
    }
    
    // 2. Verify Recipient and Amount (Requires complex logic/price feed)
    // For now, we trust the transaction was successful and update the DB.
    */

    // --- START MOCK IMPLEMENTATION (TEMPORARY FOR DEMO) ---
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network latency
    // --- END MOCK IMPLEMENTATION ---

    // Safely proceed to update the order status as verified
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
      "paymentDetails.transactionId": txHash,
      "paymentDetails.paidAt": Date.now(),
      "paymentDetails.currency": currency,
      "paymentDetails.amountPaid": amountPaid,
    });

    res.json({
      success: true,
      message: "Crypto payment verified and order confirmed",
    });
  } catch (error) {
    console.error("Crypto Verification Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing crypto verification",
    });
  }
});
// Create Razorpay order
router.post("/create-order", protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: orderId,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment verified
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        "paymentDetails.transactionId": razorpay_payment_id,
        "paymentDetails.paidAt": Date.now(),
        orderStatus: "confirmed",
      });

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/exchange-rate", async (req, res) => {
  try {
    // 1. Fetch the market price from CoinGecko (ETH price in INR)
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
    );

    // The CoinGecko response structure is: { "ethereum": { "inr": 285195.6884 } }
    const ethPriceInInr = response.data.ethereum.inr;

    if (!ethPriceInInr) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch ETH price" });
    }

    // 2. Calculate the conversion rate (1 INR = X ETH)
    // You want the inverse: 1 / ETH_PRICE_IN_INR
    const inrToEthRate = 1 / ethPriceInInr;

    res.json({
      success: true,
      // Price of 1 INR in ETH (e.g., 1 / 285195.6884 = 0.0000035064 ETH)
      inrToEthRate: inrToEthRate,
      ethPriceInInr: ethPriceInInr,
    });
  } catch (error) {
    console.error("Exchange Rate API Error:", error.message);
    // Fallback or error status
    res.status(500).json({
      success: false,
      message: "Error fetching real-time crypto rate.",
    });
  }
});
module.exports = router;
