// seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path as needed

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB for seeding admin...");

    const email = "qadirdadkazi@gmail.com";
    const password = "Password1";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if an admin with this email already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit();
    }

    // Create a new admin user
    const adminUser = new User({
      name: "Admin User",
      email,
      password: hashedPassword,
      role: "admin",  // explicitly set role to admin
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
    process.exit();
  })
  .catch(err => {
    console.error("Error seeding admin:", err);
    process.exit(1);
  });
