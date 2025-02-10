import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <Card>
      {product.qrImageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={product.qrImageUrl}
          alt={product.name}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h5">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="h6" color="primary">
          ${product.price}
        </Typography>
        <Button variant="outlined" component={Link} to={`/product/${product._id}`} sx={{ mt: 1 }}>
          View Details
        </Button>
        <Button variant="contained" color="primary" onClick={handleAddToCart} sx={{ mt: 1, ml: 1 }}>
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
