const QRCode = require("qrcode");

exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    // Generate QR code URL
    const qrCodeData = `https://your-frontend-url/product/${name}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);

    const newProduct = new Product({ name, price, description, image, qrCode });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
};
