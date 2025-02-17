import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Box,
  Tabs,
  Tab,
  Paper,
  IconButton,
  TextField,
  Chip,
  Divider,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  Share,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

// TabPanel component for tabbed sections
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [wishlist, setWishlist] = useState(false);
  const { addToCart } = useCart();

  // Fetch product details
  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(response => {
        setProduct(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
        setLoading(false);
        toast.error('Error loading product details');
      });
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    toast.success('Added to cart!');
  };

  const toggleWishlist = () => {
    setWishlist(!wishlist);
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    navigator.share({
      title: product.name,
      text: product.description,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    });
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Product not found.</Typography>
      </Container>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Image Gallery */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <TransformWrapper>
              <TransformComponent>
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  style={{ width: '100%', height: 'auto' }}
                />
              </TransformComponent>
            </TransformWrapper>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid primary.main' : 'none',
                  }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          
          {/* Price and Discount */}
          <Box sx={{ mb: 2 }}>
            {product.discount > 0 ? (
              <>
                <Typography
                  variant="h4"
                  color="primary"
                  component="span"
                  sx={{ mr: 2 }}
                >
                  ${discountedPrice.toFixed(2)}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  component="span"
                  sx={{ textDecoration: 'line-through' }}
                >
                  ${product.price.toFixed(2)}
                </Typography>
                <Chip
                  label={`${product.discount}% OFF`}
                  color="error"
                  size="small"
                  sx={{ ml: 2 }}
                />
              </>
            ) : (
              <Typography variant="h4" color="primary">
                ${product.price.toFixed(2)}
              </Typography>
            )}
          </Box>

          {/* Variants */}
          {product.specifications && (
            <Box sx={{ mb: 2 }}>
              {Object.entries(product.specifications).map(([key, values]) => (
                <FormControl key={key} fullWidth sx={{ mb: 1 }}>
                  <InputLabel>{key}</InputLabel>
                  <Select
                    value={selectedVariant[key] || ''}
                    onChange={(e) => setSelectedVariant({
                      ...selectedVariant,
                      [key]: e.target.value
                    })}
                    label={key}
                  >
                    {values.split(',').map(value => (
                      <MenuItem key={value.trim()} value={value.trim()}>
                        {value.trim()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
          )}

          {/* Quantity Selector */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => handleQuantityChange(-1)}>
              <RemoveIcon />
            </IconButton>
            <TextField
              value={quantity}
              InputProps={{ readOnly: true }}
              sx={{ width: 60, mx: 1 }}
            />
            <IconButton onClick={() => handleQuantityChange(1)}>
              <AddIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 2 }}>
              {product.stock} items available
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleAddToCart}
              sx={{ mb: 1 }}
            >
              Add to Cart
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={toggleWishlist}
                startIcon={wishlist ? <Favorite /> : <FavoriteBorder />}
                sx={{ flex: 1 }}
              >
                {wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleShare}
                startIcon={<Share />}
                sx={{ flex: 1 }}
              >
                Share
              </Button>
            </Box>
          </Box>

          {/* QR Code for AR */}
          {product.qrCode && (
            <Paper elevation={2} sx={{ p: 2, mb: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                AR View
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Scan this QR code with your mobile device to view the product in AR
              </Typography>
              <Box
                sx={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto',
                  padding: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src={product.qrCode}
                  alt="AR View QR Code"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Tabbed Sections */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label="Description" />
              <Tab label="Specifications" />
              <Tab label="Reviews" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1">
                {product.description}
              </Typography>
              {product.features && product.features.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Key Features
                  </Typography>
                  <ul>
                    {product.features.map((feature, index) => (
                      <li key={index}>
                        <Typography variant="body1">{feature}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {product.specifications && (
                <Grid container spacing={2}>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="subtitle1" color="text.secondary">
                        {key}
                      </Typography>
                      <Typography variant="body1">
                        {value}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {product.ratings && product.ratings.length > 0 ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                      {product.averageRating.toFixed(1)}
                    </Typography>
                    <Rating value={product.averageRating} precision={0.5} readOnly />
                    <Typography color="text.secondary">
                      ({product.ratings.length} reviews)
                    </Typography>
                  </Box>
                  {product.ratings.map((rating, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Rating value={rating.rating} readOnly />
                      <Typography variant="body1">{rating.review}</Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography>No reviews yet.</Typography>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
