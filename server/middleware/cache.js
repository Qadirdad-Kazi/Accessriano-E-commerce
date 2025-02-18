const NodeCache = require('node-cache');
const cache = new NodeCache({
    stdTTL: 600, // Default TTL of 10 minutes
    checkperiod: 120, // Check for expired keys every 2 minutes
    useClones: false // Don't clone data on get/set for better performance
});

/**
 * Creates a middleware function that caches responses
 * @param {number} duration - Cache duration in seconds
 */
exports.cache = (duration) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create a cache key from the full URL
        const key = `__express__${req.originalUrl || req.url}`;

        try {
            // Try to get the cached response
            const cachedResponse = cache.get(key);

            if (cachedResponse) {
                // Send cached response
                res.setHeader('X-Cache', 'HIT');
                return res.send(cachedResponse);
            }

            // Store the original send
            const originalSend = res.send;

            // Override send
            res.send = function(body) {
                try {
                    // Convert buffer to string if needed
                    const responseBody = Buffer.isBuffer(body) ? body.toString() : body;
                    
                    // Store the response in cache
                    cache.set(key, responseBody, duration);
                    
                    // Set cache header
                    res.setHeader('X-Cache', 'MISS');
                    
                    // Call the original send
                    originalSend.call(this, responseBody);
                } catch (error) {
                    console.error('Cache set error:', error);
                    // If caching fails, just send the response without caching
                    originalSend.call(this, body);
                }
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            // If cache fails, continue without caching
            next();
        }
    };
};

// Export the cache instance for manual operations if needed
exports.cacheInstance = cache;