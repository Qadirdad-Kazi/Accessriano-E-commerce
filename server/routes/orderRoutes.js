const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Token-based auth middleware
const orderController = require('../controllers/orderController');

// Create a new order (protected)
router.post('/', auth, orderController.createOrder);

// Retrieve all orders for the logged-in user (protected)
router.get('/', auth, orderController.getOrders);

// Retrieve a specific order by its ID (protected)
router.get('/:id', auth, orderController.getOrderById);

// Update an order (protected)
// This could be used for order cancellation or status update
router.put('/:id', auth, orderController.updateOrder);

module.exports = router;
