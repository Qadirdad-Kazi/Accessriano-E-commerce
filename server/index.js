const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const port = process.env.PORT || 5000;

// ✅ Allow Frontend Requests Dynamically
const allowedOrigins = [
  "http://localhost:3000",
  "https://your-netlify-site.netlify.app" // Replace with your actual Netlify frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy Error: Not allowed'));
  },
  credentials: true
}));

// Middleware
app.use(express.json());

// ✅ Serve Homepage at `/`
app.get('/', (req, res) => {
  res.send(`
    <h1>Accessriano E-Commerce API 🚀</h1>
    <p>Welcome to the backend of Accesriano.</p>
    <p><strong>Available API Endpoints:</strong></p>
    <ul>
      <li><a href="/api/test">Test API</a></li>
      <li><a href="/api/products">Products API</a></li>
      <li><a href="/api/auth">Auth API</a></li>
      <li><a href="/api/orders">Orders API</a></li>
      <li><a href="/api/analytics">Analytics API</a></li>
    </ul>
  `);
});

// ✅ API Base Endpoint
app.get('/api', (req, res) => {
  res.json({
    message: "Welcome to Access Riano E-Commerce API 🚀",
    endpoints: {
      test: "/api/test",
      products: "/api/products",
      auth: "/api/auth",
      orders: "/api/orders",
      analytics: "/api/analytics"
    }
  });
});

// ✅ Mount API Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// ✅ Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

// ✅ MongoDB Connection with Error Handling
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

module.exports = app;
