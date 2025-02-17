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
  Rating
} from '@mui/material';
import { AddShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import MotionCard from './animations/MotionCard';
import MotionButton from './animations/MotionButton';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <MotionCard delay={0.1}>
      <Box 
        onClick={handleCardClick}
        sx={{ 
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300x140?text=No+Image"}
            alt={product.name}
            sx={{ 
              objectFit: 'contain',
              backgroundColor: 'background.paper',
              p: 2
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 1
            }}
          >
            {product.featured && (
              <Chip
                label="Featured"
                color="secondary"
                size="small"
                sx={{ borderRadius: '16px' }}
              />
            )}
            <IconButton
              size="small"
              onClick={handleFavoriteClick}
              sx={{
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'background.paper' }
              }}
            >
              {isFavorite ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating 
              value={product.averageRating || 0} 
              readOnly 
              precision={0.5}
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.numberOfReviews || 0})
            </Typography>
          </Box>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: '40px'
            }}
          >
            {product.description}
          </Typography>

          <Box sx={{ 
            mt: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" color="primary">
              ${product.price.toFixed(2)}
            </Typography>
            
            <Tooltip title="Add to cart">
              <MotionButton
                variant="contained"
                color="primary"
                size="small"
                onClick={handleAddToCart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                startIcon={<AddShoppingCart />}
              >
                Add to Cart
              </MotionButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Box>
    </MotionCard>
  );
};

export default ProductCard;
