const Razorpay = require("razorpay");
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");
const {
  verifyEthereumTransaction,
  isBlockchainServiceAvailable,
} = require("../utils/blockchainService");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
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
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res) => {
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
      // Payment verified - update order with proper error handling
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: "paid",
          "paymentDetails.transactionId": razorpay_payment_id,
          "paymentDetails.paidAt": Date.now(),
          orderStatus: "confirmed",
        },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found - payment verified but order update failed",
        });
      }

      res.json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify crypto payment
// @route   POST /api/payment/verify-crypto
// @access  Private
exports.verifyCryptoPayment = async (req, res) => {
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

    // --- BLOCKCHAIN VERIFICATION ---
    let isVerified = false;
    let verificationDetails = null;

    // Check if blockchain service is available and properly configured
    const serviceAvailable = await isBlockchainServiceAvailable();

    if (serviceAvailable && process.env.NODE_ENV === "production") {
      try {
        console.log(`Verifying blockchain transaction: ${txHash}`);

        // Verify the transaction on the blockchain
        const result = await verifyEthereumTransaction(
          txHash,
          process.env.PAYMENT_WALLET_ADDRESS,
          null // We'll verify amount based on order total separately
        );

        if (!result.verified) {
          return res.status(400).json({
            success: false,
            message: result.message || "Transaction verification failed",
            details: result,
          });
        }

        isVerified = true;
        verificationDetails = result;
        console.log("✅ Transaction verified on blockchain");
      } catch (error) {
        console.error("Blockchain verification error:", error);
        return res.status(400).json({
          success: false,
          message: "Failed to verify transaction on blockchain",
          error: error.message,
        });
      }
    } else if (process.env.NODE_ENV !== "production") {
      // Development/Demo mode - mock verification
      console.warn("⚠️ Demo mode: Using mock blockchain verification");
      await new Promise((resolve) => setTimeout(resolve, 500));
      isVerified = true;
      verificationDetails = {
        verified: true,
        message: "Mock verification (development mode)",
        transactionHash: txHash,
      };
    } else {
      return res.status(503).json({
        success: false,
        message:
          "Blockchain verification service not configured. Please contact support.",
      });
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Transaction verification failed",
      });
    }

    // Safely proceed to update the order status as verified
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        "paymentDetails.transactionId": txHash,
        "paymentDetails.paidAt": Date.now(),
        "paymentDetails.currency": currency,
        "paymentDetails.amountPaid": amountPaid,
        "paymentDetails.blockchainVerified": isVerified,
        "paymentDetails.verificationDetails": verificationDetails
          ? JSON.stringify({
              blockNumber: verificationDetails.blockNumber,
              confirmations: verificationDetails.confirmations,
              from: verificationDetails.from,
            })
          : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found - payment verified but order update failed",
      });
    }

    res.json({
      success: true,
      message: "Crypto payment verified and order confirmed",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Crypto Verification Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error processing crypto verification",
    });
  }
};

// @desc    Get crypto exchange rate (INR to ETH)
// @route   GET /api/payment/exchange-rate
// @access  Public
exports.getExchangeRate = async (req, res) => {
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
    // Fallback or error status with consistent response format
    return res.status(500).json({
      success: false,
      message: "Error fetching real-time crypto rate.",
      error: error.message,
    });
  }
};
