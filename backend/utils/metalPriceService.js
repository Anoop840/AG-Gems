const axios = require("axios");

const API_KEY = process.env.METALS_API_KEY;
const BASE_URL = "https://api.metals.dev/v1/latest"; // Using metals.dev as an example

/**
 * Fetches the latest prices for specified metals.
 * @returns {Promise<Object>} An object with metal prices, e.g., { gold: 1800, silver: 25 }.
 */
const getLatestMetalPrices = async () => {
  if (!API_KEY) {
    console.warn("METALS_API_KEY is not set. Dynamic pricing will not work.");
    // Return mock data or throw an error
    // For demonstration, we'll throw an error to make it clear.
    throw new Error("Metals API key is missing.");
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        currency: "INR", // Or your base currency
        units: "gram", // Get price per gram
        metals: "XAU,XAG", // Gold and Silver symbols
      },
    });

    if (response.data && response.data.rates) {
      const rates = response.data.rates;
      // The API might return prices based on a base currency (like USD),
      // so you might need to convert them. Assuming the API gives direct rates here.
      const prices = {
        gold: rates.XAU,
        silver: rates.XAG,
      };
      console.log("Fetched latest metal prices:", prices);
      return prices;
    } else {
      throw new Error("Invalid response from Metals API");
    }
  } catch (error) {
    console.error(
      "Error fetching metal prices:",
      error.response ? error.response.data : error.message
    );
    throw error; // Re-throw to be caught by the cron job
  }
};

module.exports = { getLatestMetalPrices };
