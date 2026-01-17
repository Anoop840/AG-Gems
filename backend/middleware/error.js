// backend/middleware/error.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for the developer
  console.error(`[Error] ${err.stack}`);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  // Axios/Network Errors
  if (err.isAxiosError) {
    const message =
      err.response?.data?.message || "External API request failed";
    return res
      .status(err.response?.status || 500)
      .json({ success: false, message });
  }

  // Razorpay Errors
  if (err.error && err.error.code) {
    return res.status(400).json({
      success: false,
      message: `Payment error: ${
        err.error.description || "Transaction failed"
      }`,
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

module.exports = errorHandler;
