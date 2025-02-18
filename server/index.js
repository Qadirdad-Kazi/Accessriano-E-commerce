const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./utils/errorHandler');
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const contactRoutes = require('./routes/contactRoutes');
const searchRoutes = require('./routes/searchRoutes');
const apiRoutes = require('./routes/apiRoutes');
const cartRoutes = require('./routes/cart');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://accessriano-e-commerce.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accessriano')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// API Routes
console.log('Mounting routes...');
app.use('/api/auth', authRoutes);
console.log('Mounted /api/auth route');
app.use('/api/products', productRoutes);
console.log('Mounted /api/products route');
app.use('/api/orders', orderRoutes);
console.log('Mounted /api/orders route');
app.use('/api/analytics', analyticsRoutes);
console.log('Mounted /api/analytics route');
app.use('/api/chatbot', chatbotRoutes);
console.log('Mounted /api/chatbot route');
app.use('/api/reviews', reviewRoutes);
console.log('Mounted /api/reviews route');
app.use('/api/categories', categoryRoutes);
console.log('Mounted /api/categories route');
app.use('/api/wishlist', wishlistRoutes);
console.log('Mounted /api/wishlist route');
app.use('/api/contact', contactRoutes);
console.log('Mounted /api/contact route');
app.use('/api/search', searchRoutes);
console.log('Mounted /api/search route');
app.use('/api/external', apiRoutes);
console.log('Mounted /api/external route');
app.use('/api/cart', cartRoutes);
console.log('Mounted /api/cart route');

// API Documentation Route
app.get('/api', (req, res) => {
  res.json({
    message: "Welcome to Accessriano E-Commerce API",
    endpoints: {
      products: "/api/products",
      auth: "/api/auth",
      orders: "/api/orders",
      analytics: "/api/analytics",
      chatbot: "/api/chatbot",
      reviews: "/api/reviews",
      categories: "/api/categories",
      wishlist: "/api/wishlist",
      contact: "/api/contact",
      search: "/api/search"
    }
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
