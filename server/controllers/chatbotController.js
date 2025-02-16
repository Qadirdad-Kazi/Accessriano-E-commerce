const dialogflowService = require('../services/dialogflowService');
const Product = require('../models/Product');

exports.handleMessage = async (req, res) => {
  try {
    const { message, sessionId, language = 'en' } = req.body;
    const response = await dialogflowService.handleProductQuery(sessionId, message, language);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.getProductSuggestions = async (req, res) => {
  try {
    const { category, priceRange } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      query.price = { $gte: min, $lte: max };
    }
    
    const products = await Product.find(query)
      .select('name price category productImageUrl')
      .limit(5);
      
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error getting product suggestions:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
