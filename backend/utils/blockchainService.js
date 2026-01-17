/**
 * Blockchain Verification Utility
 *
 * This module provides real Ethereum blockchain transaction verification
 * for cryptocurrency payments in production environments.
 *
 * Usage:
 * const { verifyEthereumTransaction } = require('../utils/blockchainService');
 * const result = await verifyEthereumTransaction(txHash, expectedAmount, recipientAddress);
 */

const { ethers } = require("ethers");

/**
 * Verify an Ethereum transaction on the blockchain
 *
 * @param {string} txHash - Transaction hash to verify
 * @param {string} expectedRecipient - Expected recipient wallet address
 * @param {number} minimumAmount - Minimum amount in ETH (optional)
 * @returns {Promise<Object>} Verification result
 */
async function verifyEthereumTransaction(
  txHash,
  expectedRecipient,
  minimumAmount = null
) {
  try {
    // Validate inputs
    if (!txHash || !expectedRecipient) {
      throw new Error("Transaction hash and recipient address are required");
    }

    // Check if RPC URL is configured
    if (!process.env.ETH_RPC_URL) {
      throw new Error("ETH_RPC_URL not configured in environment variables");
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

    // Get transaction receipt (waits for confirmation)
    console.log(`Fetching transaction: ${txHash}`);
    const txReceipt = await provider.waitForTransaction(txHash, 1, 60000); // 1 confirmation, 60s timeout

    if (!txReceipt) {
      return {
        success: false,
        message: "Transaction not found on blockchain",
        verified: false,
      };
    }

    // Check if transaction was successful
    if (txReceipt.status !== 1) {
      return {
        success: false,
        message: "Transaction failed on blockchain",
        verified: false,
        receipt: txReceipt,
      };
    }

    // Get full transaction details
    const tx = await provider.getTransaction(txHash);

    if (!tx) {
      return {
        success: false,
        message: "Transaction details not found",
        verified: false,
      };
    }

    // Verify recipient address
    const normalizedRecipient = expectedRecipient.toLowerCase();
    const actualRecipient = tx.to?.toLowerCase();

    if (actualRecipient !== normalizedRecipient) {
      return {
        success: false,
        message: `Transaction sent to wrong address. Expected: ${normalizedRecipient}, Got: ${actualRecipient}`,
        verified: false,
        receipt: txReceipt,
      };
    }

    // Verify amount (if specified)
    const amountInEth = ethers.formatEther(tx.value);

    if (minimumAmount && parseFloat(amountInEth) < minimumAmount) {
      return {
        success: false,
        message: `Insufficient amount. Expected: ${minimumAmount} ETH, Got: ${amountInEth} ETH`,
        verified: false,
        amount: amountInEth,
        receipt: txReceipt,
      };
    }

    // Transaction verified successfully
    return {
      success: true,
      verified: true,
      message: "Transaction verified successfully",
      transactionHash: txHash,
      from: tx.from,
      to: tx.to,
      amount: amountInEth,
      amountWei: tx.value.toString(),
      blockNumber: txReceipt.blockNumber,
      confirmations: await txReceipt.confirmations(),
      gasUsed: txReceipt.gasUsed.toString(),
      receipt: txReceipt,
    };
  } catch (error) {
    console.error("Blockchain verification error:", error);

    // Handle specific error types
    if (error.code === "TIMEOUT") {
      return {
        success: false,
        message: "Transaction verification timeout",
        verified: false,
        error: error.message,
      };
    }

    if (error.code === "NETWORK_ERROR") {
      return {
        success: false,
        message: "Network error while connecting to blockchain",
        verified: false,
        error: error.message,
      };
    }

    return {
      success: false,
      message: error.message || "Unknown blockchain verification error",
      verified: false,
      error: error.message,
    };
  }
}

/**
 * Get current ETH gas price
 *
 * @returns {Promise<Object>} Current gas price information
 */
async function getCurrentGasPrice() {
  try {
    if (!process.env.ETH_RPC_URL) {
      throw new Error("ETH_RPC_URL not configured");
    }

    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const feeData = await provider.getFeeData();

    return {
      success: true,
      gasPrice: ethers.formatUnits(feeData.gasPrice, "gwei"),
      maxFeePerGas: feeData.maxFeePerGas
        ? ethers.formatUnits(feeData.maxFeePerGas, "gwei")
        : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        ? ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei")
        : null,
    };
  } catch (error) {
    console.error("Error fetching gas price:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Get wallet balance
 *
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} Wallet balance in ETH
 */
async function getWalletBalance(address) {
  try {
    if (!process.env.ETH_RPC_URL) {
      throw new Error("ETH_RPC_URL not configured");
    }

    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    const balance = await provider.getBalance(address);

    return {
      success: true,
      address,
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString(),
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Check if blockchain service is available
 *
 * @returns {Promise<boolean>} True if service is available
 */
async function isBlockchainServiceAvailable() {
  try {
    if (!process.env.ETH_RPC_URL) {
      return false;
    }

    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
    await provider.getBlockNumber();
    return true;
  } catch (error) {
    console.error("Blockchain service unavailable:", error.message);
    return false;
  }
}

module.exports = {
  verifyEthereumTransaction,
  getCurrentGasPrice,
  getWalletBalance,
  isBlockchainServiceAvailable,
};
