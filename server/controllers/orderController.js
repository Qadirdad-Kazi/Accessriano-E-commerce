const Order = require("../models/Order");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customer", "name email");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customerName, totalAmount, items } = req.body;
    const newOrder = new Order({
      customerName,
      totalAmount,
      items,
      status: "Pending",
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status" });
  }
};
