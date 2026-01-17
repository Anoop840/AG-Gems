// backend/server.js
require("express-async-errors");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");

// Ensure environment variables are loaded
dotenv.config({ path: "./.env" });

// Database connection utility (will be modified in next step)
const connectDB = require("./db");
connectDB(); // Connect to MongoDB

// Start cron jobs
if (process.env.NODE_ENV !== "test") {
  require("./jobs/inventoryAlerts");
  require("./jobs/priceUpdater");
}

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Middleware to protect against CSRF.
// For APIs, a common strategy is to ensure that state-changing requests
// only accept JSON. This prevents traditional form-based CSRF attacks.
app.use((req, res, next) => {
  const nonJsonMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (nonJsonMethods.includes(req.method)) {
    const contentType = req.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(415).json({
        success: false,
        message:
          "Unsupported Media Type: All state-changing requests must use Content-Type: application/json.",
      });
    }
  }
  next();
});

// Import Routes (Ensure all route files are correctly updated to CommonJS)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/users", require("./routes/users"));
app.use("/api/wishlist", require("./routes/wishlist"));

app.use(errorHandler);

// Basic Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// Port and Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
