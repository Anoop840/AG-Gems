const cron = require("node-cron");
const Product = require("../models/Product");
const { getLatestMetalPrices } = require("../utils/metalPriceService");

const MARKUP_PERCENTAGE = process.env.PRICING_MARKUP_PERCENTAGE || 1.5; // 50% markup

// Schedule a job to run every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("Running dynamic pricing update job...");
  try {
    const metalPrices = await getLatestMetalPrices();

    const productsToUpdate = await Product.find({
      "metal.type": { $in: ["gold", "silver"] },
      "metal.weight": { $gt: 0 },
    });

    if (productsToUpdate.length === 0) {
      console.log("No products found for dynamic price update.");
      return;
    }

    console.log(`Found ${productsToUpdate.length} products to update.`);

    for (const product of productsToUpdate) {
      const metalType = product.metal.type;
      const metalWeight = product.metal.weight;
      const currentMetalPricePerGram = metalPrices[metalType];

      if (currentMetalPricePerGram) {
        const baseCost = currentMetalPricePerGram * metalWeight;
        const newPrice = Math.round(baseCost * MARKUP_PERCENTAGE);

        if (product.price !== newPrice) {
          console.log(
            `Updating price for ${product.name} from ${product.price} to ${newPrice}`
          );
          product.price = newPrice;
          await product.save();
        }
      }
    }
    console.log("Dynamic pricing update completed.");
  } catch (error) {
    console.error("Error in dynamic pricing job:", error.message);
  }
});

console.log("Dynamic pricing update job scheduled.");
