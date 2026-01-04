// backend/server.js
require("express-async-errors");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");

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

// CSRF Protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
});

// Route to get CSRF token (must be BEFORE CSRF protection middleware)
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all state-changing routes (POST, PUT, DELETE, PATCH)
app.use((req, res, next) => {
  // Skip CSRF for GET and HEAD requests
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    return next();
  }
  // Apply CSRF protection for state-changing methods
  csrfProtection(req, res, next);
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

// Basic Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// Port and Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
