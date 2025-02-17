import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Box,
    Typography,
    Button,
    Chip,
    Rating,
    Divider,
    IconButton,
    Tab,
    Tabs,
    Skeleton,
    Alert,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    ShoppingCart as CartIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Share as ShareIcon,
    LocalShipping as ShippingIcon,
    Assignment as SpecsIcon,
    Description as DescriptionIcon,
    Reviews as ReviewsIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImageGallery from '../components/product/ImageGallery';
import QuantitySelector from '../components/product/QuantitySelector';
import ProductVariants from '../components/product/ProductVariants';
import RelatedProducts from '../components/product/RelatedProducts';
import ReviewSection from '../components/product/ReviewSection';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();

    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/products/${productId}`);
                setProduct(response.data.data);
                if (response.data.data.variants?.length > 0) {
                    setSelectedVariant(response.data.data.variants[0]);
                }
                // Check if product is in user's wishlist
                if (isAuthenticated) {
                    const wishlistResponse = await axios.get('/api/wishlist');
                    setIsFavorite(wishlistResponse.data.data.some(item => item._id === productId));
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch product details');
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, isAuthenticated]);

    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
    };

    const handleAddToCart = async () => {
        try {
            await addToCart({
                productId,
                quantity,
                variantId: selectedVariant?._id,
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                await axios.delete(`/api/wishlist/${productId}`);
            } else {
                await axios.post('/api/wishlist', { productId });
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="text" height={60} />
                        <Skeleton variant="text" height={30} />
                        <Skeleton variant="text" height={30} />
                        <Skeleton variant="rectangular" height={100} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!product) return null;

    const currentPrice = selectedVariant?.price || product.price;
    const originalPrice = selectedVariant?.originalPrice || product.originalPrice;
    const discount = originalPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;
    const inStock = selectedVariant?.stock > 0 || product.stock > 0;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* Product Images */}
                <Grid item xs={12} md={6}>
                    <ImageGallery
                        images={product.images}
                        alt={product.name}
                    />
                </Grid>

                {/* Product Info */}
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={product.averageRating} precision={0.5} readOnly />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                ({product.numberOfReviews} reviews)
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="span">
                                {formatPrice(currentPrice)}
                            </Typography>
                            {originalPrice && originalPrice > currentPrice && (
                                <>
                                    <Typography
                                        variant="h6"
                                        component="span"
                                        sx={{ textDecoration: 'line-through', mx: 2, color: 'text.secondary' }}
                                    >
                                        {formatPrice(originalPrice)}
                                    </Typography>
                                    <Chip
                                        label={`${discount}% OFF`}
                                        color="error"
                                        size="small"
                                    />
                                </>
                            )}
                        </Box>

                        {/* Product Variants */}
                        {product.variants?.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <ProductVariants
                                    variants={product.variants}
                                    selectedVariant={selectedVariant}
                                    onVariantChange={handleVariantChange}
                                />
                            </Box>
                        )}

                        {/* Quantity Selector and Add to Cart */}
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    <QuantitySelector
                                        quantity={quantity}
                                        onChange={handleQuantityChange}
                                        max={selectedVariant?.stock || product.stock}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<CartIcon />}
                                        onClick={handleAddToCart}
                                        disabled={!inStock}
                                        fullWidth
                                    >
                                        {inStock ? 'Add to Cart' : 'Out of Stock'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            <IconButton onClick={handleToggleFavorite} color={isFavorite ? 'primary' : 'default'}>
                                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                            <IconButton onClick={handleShare}>
                                <ShareIcon />
                            </IconButton>
                        </Box>

                        {/* Shipping Info */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ShippingIcon sx={{ mr: 1 }} />
                                <Typography variant="subtitle1">
                                    Shipping & Returns
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Free shipping on orders over $50. 30-day return policy.
                            </Typography>
                        </Paper>
                    </Box>
                </Grid>

                {/* Product Details Tabs */}
                <Grid item xs={12}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, newValue) => setActiveTab(newValue)}
                            variant={isMobile ? 'fullWidth' : 'standard'}
                        >
                            <Tab icon={<DescriptionIcon />} label="Description" />
                            <Tab icon={<SpecsIcon />} label="Specifications" />
                            <Tab icon={<ReviewsIcon />} label={`Reviews (${product.numberOfReviews})`} />
                        </Tabs>
                    </Box>

                    {/* Description Tab */}
                    {activeTab === 0 && (
                        <Box sx={{ py: 3 }}>
                            <Typography variant="body1">
                                {product.description}
                            </Typography>
                        </Box>
                    )}

                    {/* Specifications Tab */}
                    {activeTab === 1 && (
                        <Box sx={{ py: 3 }}>
                            <Grid container spacing={2}>
                                {product.specifications?.map((spec, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {spec.name}
                                            </Typography>
                                            <Typography variant="body1">
                                                {spec.value}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 2 && (
                        <Box sx={{ py: 3 }}>
                            <ReviewSection
                                productId={productId}
                                reviews={product.reviews}
                                averageRating={product.averageRating}
                                numberOfReviews={product.numberOfReviews}
                            />
                        </Box>
                    )}
                </Grid>

                {/* Related Products */}
                <Grid item xs={12}>
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h5" gutterBottom>
                        Related Products
                    </Typography>
                    <RelatedProducts
                        productId={productId}
                        category={product.category}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default ProductDetails;
