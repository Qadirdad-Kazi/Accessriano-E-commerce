import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import React from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const fallbackImage = "https://via.placeholder.com/300x140?text=No+Image";

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <Card>
      <CardMedia
        component="img"
        height="200"
        image={product.productImageUrl || fallbackImage}
        alt={product.name}
      />
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
