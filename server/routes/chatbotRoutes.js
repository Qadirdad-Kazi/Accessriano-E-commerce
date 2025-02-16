const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/message', chatbotController.handleMessage);
router.get('/suggestions', chatbotController.getProductSuggestions);

module.exports = router;
