// server/index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const productRoutes = require('./routes/productRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Mount product routes
app.use('/api/products', productRoutes);

// Test route to verify the server is running
app.get('/api/test', (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully.");

    // Start the server after a successful database connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });
