import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Chip,
  Rating,
  CircularProgress
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import MotionCard from './animations/MotionCard';
import { formatPrice } from '../utils/formatters';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [loading, setLoading] = React.useState({
    cart: false,
    wishlist: false
  });

  const handleCardClick = () => {
    if (product?._id) {
      navigate(`/product/${product._id}`);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!product?.stock) {
      return;
    }

    setLoading(prev => ({ ...prev, cart: true }));
    try {
      await addToCart(product._id, 1);
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(prev => ({ ...prev, wishlist: true }));
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }));
    }
  };

  if (!product) {
    return null;
  }

  const isProductInWishlist = isInWishlist(product._id);

  return (
    <MotionCard delay={0.1}>
      <Box 
        onClick={handleCardClick}
        sx={{ 
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {product.onSale && (
          <Chip
            label={`${product.discountPercentage}% OFF`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1
            }}
          />
        )}
        
        <CardMedia
          component="img"
          height="200"
          image={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          sx={{
            objectFit: 'contain',
            backgroundColor: 'background.paper'
          }}
        />

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="h2" noWrap>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={product.rating || 0} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.numReviews || 0})
            </Typography>
          </Box>

          <Typography variant="h6" color="primary" gutterBottom>
            {formatPrice(product.discountPrice || product.price)}
            {product.discountPrice && (
              <Typography
                component="span"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.secondary',
                  ml: 1,
                  fontSize: '0.9em'
                }}
              >
                {formatPrice(product.price)}
              </Typography>
            )}
          </Typography>

          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
            <IconButton
              onClick={handleAddToCart}
              color="primary"
              disabled={!product.stock || loading.cart}
              sx={{ mr: 1 }}
            >
              {loading.cart ? (
                <CircularProgress size={24} />
              ) : (
                <Tooltip title={product.stock ? 'Add to Cart' : 'Out of Stock'}>
                  <AddShoppingCart />
                </Tooltip>
              )}
            </IconButton>

            <IconButton
              onClick={handleWishlistClick}
              color={isProductInWishlist ? 'error' : 'default'}
              disabled={loading.wishlist}
            >
              {loading.wishlist ? (
                <CircularProgress size={24} />
              ) : (
                isProductInWishlist ? <Favorite /> : <FavoriteBorder />
              )}
            </IconButton>
          </Box>
        </CardContent>
      </Box>
    </MotionCard>
  );
};

export default ProductCard;
