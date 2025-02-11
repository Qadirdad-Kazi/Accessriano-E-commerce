const Order = require('../models/Order');
const Product = require('../models/Product');
// If you have a Review model, you can import and use it for reviews data

exports.getAnalytics = async (req, res) => {
  try {
    // Calculate total orders and products
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // For demonstration, if you don't have reviews, you can use dummy values.
    const totalReviews = 85; // or use: await Review.countDocuments();
    const averageRating = 4.2; // Replace with actual calculation if you have review ratings

    res.status(200).json({
      message: 'Analytics data fetched successfully',
      data: { totalOrders, totalProducts, totalReviews, averageRating },
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Error fetching analytics data', error });
  }
};
