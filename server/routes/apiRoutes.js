const express = require('express');
const router = express.Router();
const axios = require('axios');
const { cache } = require('../middleware/cache');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const searchService = require('../services/searchService');

// Popular searches endpoint
router.get('/search/popular', cache(3600), catchAsync(async (req, res) => {
    const popularSearches = await searchService.getPopularSearches();
    res.json({
        status: 'success',
        data: popularSearches
    });
}));

// Search endpoint
router.get('/search', catchAsync(async (req, res) => {
    const { q } = req.query;
    if (!q) {
        throw new AppError('Search query is required', 400);
    }

    const results = await searchService.search(q);
    res.json({
        status: 'success',
        data: results
    });
}));

// Proxy route for ipapi.co
router.get('/location', cache(3600), catchAsync(async (req, res) => {
    try {
        const response = await axios.get('https://ipapi.co/json/', {
            timeout: 5000,
            headers: {
                'User-Agent': 'Accessriano-Ecommerce/1.0',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.data || response.data.error) {
            // Fallback to default location if API fails
            return res.json({
                country: 'PK',
                currency: 'PKR',
                country_name: 'Pakistan',
                city: 'Karachi',
                timezone: 'Asia/Karachi'
            });
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching location data:', error);
        
        // Return fallback data on error
        res.json({
            country: 'PK',
            currency: 'PKR',
            country_name: 'Pakistan',
            city: 'Karachi',
            timezone: 'Asia/Karachi'
        });
    }
}));

// Currency conversion route
router.get('/currency/convert', cache(3600), catchAsync(async (req, res) => {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
        throw new AppError('Missing required parameters: from, to, amount', 400);
    }

    try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`, {
            timeout: 5000
        });

        if (!response.data || !response.data.rates || !response.data.rates[to]) {
            throw new AppError('Invalid response from currency service', 502);
        }

        const rate = response.data.rates[to];
        const convertedAmount = parseFloat(amount) * rate;

        res.json({
            success: true,
            data: {
                from,
                to,
                amount: parseFloat(amount),
                rate,
                result: convertedAmount
            }
        });
    } catch (error) {
        if (error instanceof AppError) throw error;

        console.error('Currency conversion error:', error);
        throw new AppError(
            'Error converting currency. Please try again later.',
            error.response?.status || 500
        );
    }
}));

// Health check route
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;