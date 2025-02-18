const crypto = require('crypto');

const generateResetToken = (email) => {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    // Here you can also store the token in the database with an expiration time
    return token;
};

module.exports = { generateResetToken };
