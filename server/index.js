const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Set up CORS
app.use(cors({ origin: '*' }));

// Middleware to parse JSON
app.use(express.json());

// Content Security Policy (CSP) Fix
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src *; font-src * data:; img-src * data:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';");
  next();
});

// ✅ Default Route for Homepage `/`
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Access Riano E-Commerce API 🚀</h1>
    <p>Use the API endpoints to access data.</p>
    <p>Test the API: <a href="/api/test">Click here</a></p>
  `);
});

// Mount API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

module.exports = app; // Required for Vercel
