const cron = require("node-cron");
const Product = require("../models/Product");
const { sendLowStockAlert } = require("../utils/emailService");

// Schedule a job to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily check for low stock items...");
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
      isActive: true,
    }).populate("category");

    if (lowStockProducts.length > 0) {
      console.log(
        `Found ${lowStockProducts.length} low-stock products. Sending alert...`
      );
      // Assuming you have an admin email in your environment variables
      const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
      await sendLowStockAlert(adminEmail, lowStockProducts);
      console.log("Low stock alert email sent successfully.");
    } else {
      console.log("No low-stock items found.");
    }
  } catch (error) {
    console.error("Error checking for low stock products:", error);
  }
});

console.log("Inventory alert job scheduled.");
