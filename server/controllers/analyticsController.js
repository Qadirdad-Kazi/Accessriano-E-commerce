const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Get sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          amount: { $sum: "$totalAmount" }
        }
      },
      { 
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day"
                }
              }
            }
          },
          amount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(monthlyRevenue);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ message: 'Error fetching sales analytics' });
  }
};

// Get category analytics
exports.getCategoryAnalytics = async (req, res) => {
  try {
    const categoryData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          value: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1
        }
      }
    ]);

    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({ message: 'Error fetching category analytics' });
  }
};

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Get basic statistics
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments()
    ]);

    // Get recent orders (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: yesterday }
    });

    // Get revenue statistics
    const revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    // Get product statistics
    const productStats = {
      total: totalProducts,
      inStock: await Product.countDocuments({ countInStock: { $gt: 0 } }),
      outOfStock: await Product.countDocuments({ countInStock: 0 })
    };

    // Get user statistics
    const userStats = {
      total: totalUsers,
      admins: await User.countDocuments({ role: 'admin' }),
      customers: await User.countDocuments({ role: 'user' })
    };

    res.json({
      orders: {
        total: totalOrders,
        recent: recentOrders
      },
      revenue: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 },
      products: productStats,
      users: userStats
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Error fetching dashboard analytics' });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    console.log('Fetching analytics data...');

    // Get basic statistics with default values
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments() || 0,
      Product.countDocuments() || 0,
      User.countDocuments() || 0
    ]);

    console.log('Basic counts:', { totalOrders, totalProducts, totalUsers });

    // Get recent orders (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentOrders = await Order.find({
      createdAt: { $gte: yesterday }
    }).countDocuments() || 0;

    // Get revenue statistics (handle case with no orders)
    let revenueStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    // If no revenue stats, provide defaults
    if (!revenueStats || revenueStats.length === 0) {
      revenueStats = [{
        totalRevenue: 0,
        averageOrderValue: 0
      }];
    }

    // Get all products with their stock status
    const allProducts = await Product.find({}, 'name countInStock price');
    console.log('Products found:', allProducts.length);

    // Calculate product statistics
    const productStats = {
      total: totalProducts,
      inStock: allProducts.filter(p => p.countInStock > 0).length,
      outOfStock: allProducts.filter(p => p.countInStock === 0).length,
      products: allProducts.map(p => ({
        id: p._id,
        name: p.name,
        inStock: p.countInStock > 0,
        price: p.price
      }))
    };

    // Get user statistics
    const userStats = {
      total: totalUsers,
      admins: await User.countDocuments({ role: 'admin' }) || 0,
      customers: await User.countDocuments({ role: 'user' }) || 0
    };

    // Format monthly revenue (provide empty data if no orders)
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]) || [];

    // Create revenue data with all months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    const revenueData = monthNames.map((month, index) => {
      const monthData = monthlyRevenue.find(m => 
        m._id.month === (index + 1) && m._id.year === currentYear
      );
      return {
        month,
        revenue: monthData ? monthData.revenue : 0
      };
    });

    // Prepare response data
    const analyticsData = {
      orders: {
        total: totalOrders,
        recent: recentOrders
      },
      products: productStats,
      users: userStats,
      revenue: {
        total: revenueStats[0].totalRevenue || 0,
        average: revenueStats[0].averageOrderValue || 0
      },
      revenueData,
      topProducts: productStats.products.slice(0, 5).map(p => ({
        name: p.name,
        quantity: p.inStock ? 1 : 0, // Placeholder since we don't have sales data yet
        price: p.price
      }))
    };

    console.log('Analytics data prepared successfully');

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error in analytics controller:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics data', 
      error: error.message 
    });
  }
};
