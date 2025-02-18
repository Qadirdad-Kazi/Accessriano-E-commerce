const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Registration attempt for:', { email });

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password
        }
      });
    }

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Registration failed: User already exists:', { email });
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Set role to 'admin' for a specific email, otherwise 'user'
    const role = email === "qadirdadkazi@gmail.com" ? "admin" : "user";

    // Create a new user instance with role included
    user = new User({ name, email, password, role });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user in the database
    await user.save();
    console.log('User registered successfully:', { email, role });

    // Generate JWT token including the user's role and consistent id
    const payload = { 
      user: { 
        id: user._id.toString(),
        role: user.role 
      } 
    };
    
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// User Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide both email and password',
        missing: {
          email: !email,
          password: !password
        }
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found:', { email });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('User found:', { email: user.email, role: user.role });

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Invalid password for user:', { email });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token including the user's role and consistent id
    const payload = { 
      user: { 
        id: user._id.toString(),
        role: user.role 
      } 
    };
    
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '1h' }
    );

    console.log('Login successful for user:', { email, role: user.role });
    res.status(200).json({ 
      success: true,
      message: 'Logged in successfully', 
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get User Profile (Protected Route)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};
