// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;
  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Check if user still exists and is active
    const currentUser = await User.findById(decoded.id).select(
      "+isActive +passwordChangedAt"
    );
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "This account has been deactivated.",
      });
    }

    // 3. Check if user changed password after the token was issued
    if (currentUser.passwordChangedAt) {
      // Convert token issued at time to milliseconds for accurate comparison
      const tokenIssuedAt = decoded.iat * 1000;
      const passwordChangedTime = currentUser.passwordChangedAt.getTime();

      if (tokenIssuedAt < passwordChangedTime) {
        return res.status(401).json({
          success: false,
          message: "User recently changed password. Please log in again.",
        });
      }
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role (${req.user.role}) is not authorized to access this route`,
      });
    }
    next(); // Continue if authorized
  };
};
