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
  "https://your-netlify-site.netlify.app" // Replace with your Netlify URL
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

// ✅ Dynamic API URL for Frontend (localhost & production)
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? "https://accessriano-e-commerce.vercel.app/api"
  : "http://localhost:5000/api";

app.get('/', (req, res) => {
  res.send(`
    <h1>Access Riano E-Commerce API 🚀</h1>
    <p>Test API: <a href="/api/test">Click here</a></p>
  `);
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
