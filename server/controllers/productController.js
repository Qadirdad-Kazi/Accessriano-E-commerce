// server/controllers/productController.js
// (Assuming you have a Product model defined for saving data to MongoDB)
exports.addProduct = async (req, res) => {
    try {
      // Product details coming from the request body
      const productData = req.body;
  
      // If a file is uploaded, get its URL from Cloudinary
      if (req.file) {
        productData.qrImageUrl = req.file.path; // Cloudinary returns the image URL in 'path'
      }
  
      // Save the product data to the database (using your Product model)
      // Example (uncomment and modify when Product model is ready):
      // const product = new Product(productData);
      // await product.save();
  
      res.status(201).json({
        message: 'Product added successfully',
        data: productData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding product', error });
    }
  };
  