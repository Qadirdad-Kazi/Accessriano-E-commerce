const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const userId = req.user.id; // Set by auth middleware

    const newOrder = new Order({
      user: userId,
      products,
      totalAmount,
      status: 'pending',
    });

    await newOrder.save();
    res.status(201).json({
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// Retrieve all orders for the logged-in user
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).populate('products.product');
    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving orders', error });
  }
};

// Retrieve a specific order by its ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Optionally, add a check to ensure the order belongs to the user (or the user is admin)
    res.status(200).json({
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving order', error });
  }
};

// Update an order (e.g., updating status)
exports.updateOrder = async (req, res) => {
  try {
    const updates = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order', error });
  }
};
