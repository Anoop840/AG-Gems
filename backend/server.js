// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Ensure environment variables are loaded
dotenv.config({ path: './.env' });

// Database connection utility (will be modified in next step)
const connectDB = require('./db');
connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

// Import Routes (Ensure all route files are correctly updated to CommonJS)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/users', require('./routes/users')); 

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Port and Server Start
const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);