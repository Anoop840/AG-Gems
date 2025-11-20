// frontend/app/api/auth/[...route]/route.js

import connectDB from '@/server/db'
import User from '@/server/models/User'
import jwt from 'jsonwebtoken'
import { protect } from '@/server/middleware/auth'

// Connect to DB once for all handlers
connectDB();

// A central function to handle the request logic and return a Next.js Response
async function handler(req, { params }) {
  const route = params.route.join('/');

  try {
    switch (route) {
      case 'register':
        if (req.method !== 'POST') return new Response(null, { status: 405 });
        const registerBody = await req.json();

        // **Registration Logic (from backend/routes/auth.js)**
        const { firstName, lastName, email, password, phone } = registerBody;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          return new Response(JSON.stringify({ success: false, message: 'Email already registered' }), { status: 400 });
        }

        const user = await User.create({ firstName, lastName, email, password, phone });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return new Response(JSON.stringify({
          success: true,
          token,
          user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
        }), { status: 201 });

      case 'login':
        if (req.method !== 'POST') return new Response(null, { status: 405 });
        const loginBody = await req.json();

        // **Login Logic (from backend/routes/auth.js)**
        const { email: loginEmail, password: loginPassword } = loginBody;
        const loginUser = await User.findOne({ email: loginEmail }).select('+password');

        if (!loginUser || !(await loginUser.comparePassword(loginPassword))) {
          return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), { status: 401 });
        }

        const loginToken = jwt.sign({ id: loginUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return new Response(JSON.stringify({
          success: true,
          token: loginToken,
          user: { id: loginUser._id, firstName: loginUser.firstName, lastName: loginUser.lastName, email: loginUser.email, role: loginUser.role }
        }), { status: 200 });

      case 'me':
        if (req.method !== 'GET') return new Response(null, { status: 405 });

        // **Protect Middleware Execution**
        const userOrResponse = await protect(req);
        if (userOrResponse instanceof Response) return userOrResponse;
        const currentUser = userOrResponse;

        // **Get Current User Logic (from backend/routes/auth.js)**
        return new Response(JSON.stringify({ success: true, user: currentUser }), { status: 200 });

      // Add other routes like 'forgot-password' and 'reset-password/:token' here

      default:
        return new Response(JSON.stringify({ success: false, message: 'Route not found' }), { status: 404 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}

export const POST = handler;
export const GET = handler;

// For other methods, you can define them as well:
// export const PUT = handler;
// export const DELETE = handler;