// frontend/server/middleware/auth.js
const jwt=require('jsonwebtoken')
const User=require('../models/User'); // Updated path

exports.protect = async (req, res, next) => {
  let token;
  // Get token from header (Next.js req.headers.get is replaced with Express req.headers)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find user and attach it to the request object
    req.user = await User.findById(decoded.id); 

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next(); // IMPORTANT: Continue to the next middleware/route handler
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role (${req.user.role}) is not authorized to access this route`
      });
    }
    next(); // Continue if authorized
  };
};