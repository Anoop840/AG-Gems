// frontend/server/middleware/auth.js

import jwt from 'jsonwebtoken';
import User from '../models/User'; // Updated path
import { NextResponse } from 'next/server';

// Helper function to handle JSON responses in Next.js Route Handlers
const createErrorResponse = (status, message) => {
  return NextResponse.json({ success: false, message }, { status });
};

export const protect = async (req) => {
  let token;
  const authHeader = req.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return createErrorResponse(401, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return createErrorResponse(401, 'User not found');
    }

    // Return the user object if successful, instead of calling next()
    return user; 

  } catch (error) {
    return createErrorResponse(401, 'Not authorized to access this route');
  }
};

export const authorize = (user, ...roles) => {
  if (!roles.includes(user.role)) {
    return createErrorResponse(
      403,
      'User role is not authorized to access this route'
    );
  }
  // Return true if authorized
  return true;
};