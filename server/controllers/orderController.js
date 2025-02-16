const Order = require('../models/Order');
const Product = require('../models/Product');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    console.log('Creating order with payload:', req.body);
    const { products, totalAmount, shippingAddress, paymentMethod = 'cod' } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required and must not be empty'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.country || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Validate products and calculate total
    let calculatedTotal = 0;
    const validatedProducts = [];

    for (const item of products) {
      if (!item.product || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each product must have product ID, quantity, and price'
        });
      }

      // Fetch product to verify it exists and check price
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      // Verify price matches
      if (product.price !== item.price) {
        return res.status(400).json({
          success: false,
          message: `Price mismatch for product ${product.name}`
        });
      }

      calculatedTotal += product.price * item.quantity;
      validatedProducts.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Verify total amount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Total amount does not match with products total'
      });
    }

    const newOrder = new Order({
      user: userId,
      products: validatedProducts,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    console.log('Saving order:', newOrder);
    await newOrder.save();

    // Populate product details for the response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('products.product', 'name price')
      .populate('user', 'name email');

    console.log('Order created successfully:', populatedOrder);
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating order',
      error: error.message || 'Internal server error'
    });
  }
};

// Retrieve all orders for the logged-in user (or all orders for admin)
exports.getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await Order.find({})
        .populate('user', 'name email')
        .populate('products.product')
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: req.user.id })
        .populate('products.product')
        .sort({ createdAt: -1 });
    }
    
    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving orders',
      error: error.message 
    });
  }
};

// Retrieve a specific order by its ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving order',
      error: error.message 
    });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  try {
    const updates = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Only admin can update orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update orders' 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true }
    ).populate('products.product');

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order',
      error: error.message 
    });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Only admin can delete orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete orders' 
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting order',
      error: error.message 
    });
  }
};
