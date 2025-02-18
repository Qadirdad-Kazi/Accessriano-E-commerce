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
    CircularProgress,
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
import axiosInstance from '../utils/axios';
import ImageGallery from '../components/product/ImageGallery';
import QuantitySelector from '../components/product/QuantitySelector';
import ProductVariants from '../components/product/ProductVariants';
import RelatedProducts from '../components/product/RelatedProducts';
import ReviewSection from '../components/product/ReviewSection';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatters';
import { toast } from 'react-toastify';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({
        cart: false,
        wishlist: false
    });

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setError('Product ID is required');
                setLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get(`/products/${id}`);
                if (response.data.success) {
                    setProduct(response.data.data);
                    if (response.data.data.variants?.length > 0) {
                        setSelectedVariant(response.data.data.variants[0]);
                    }
                } else {
                    setError('Failed to fetch product details');
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch product details');
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.warning('Please login to add items to cart');
            navigate('/login');
            return;
        }

        setActionLoading(prev => ({ ...prev, cart: true }));
        try {
            await addToCart(product._id, quantity);
            toast.success('Added to cart successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to add to cart');
        } finally {
            setActionLoading(prev => ({ ...prev, cart: false }));
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            toast.warning('Please login to manage wishlist');
            navigate('/login');
            return;
        }

        setActionLoading(prev => ({ ...prev, wishlist: true }));
        try {
            if (isInWishlist(product._id)) {
                await removeFromWishlist(product._id);
            } else {
                await addToWishlist(product._id);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update wishlist');
        } finally {
            setActionLoading(prev => ({ ...prev, wishlist: false }));
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !product) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error || 'Product not found'}</Alert>
            </Container>
        );
    }

    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index} style={{ marginTop: '20px' }}>
            {value === index && children}
        </div>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Product Overview Section */}
            <Grid container spacing={4}>
                {/* Product Images */}
                <Grid item xs={12} md={6}>
                    <ImageGallery images={product.images || [product.image]} />
                </Grid>

                {/* Product Info */}
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={product.rating || 0} precision={0.5} readOnly />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({product.numReviews || 0} reviews)
                            </Typography>
                        </Box>

                        <Typography variant="h5" color="primary" gutterBottom>
                            {formatPrice(product.price)}
                        </Typography>

                        {product.stock > 0 ? (
                            <Chip 
                                label="In Stock" 
                                color="success" 
                                size="small" 
                                sx={{ mb: 2 }}
                            />
                        ) : (
                            <Chip 
                                label="Out of Stock" 
                                color="error" 
                                size="small" 
                                sx={{ mb: 2 }}
                            />
                        )}

                        <Typography variant="body1" paragraph>
                            {product.description}
                        </Typography>

                        {/* Product Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <ProductVariants 
                                    variants={product.variants}
                                    selectedVariant={selectedVariant}
                                    onVariantChange={handleVariantChange}
                                />
                            </Box>
                        )}

                        {/* Quantity Selector and Add to Cart */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <QuantitySelector
                                quantity={quantity}
                                onChange={handleQuantityChange}
                                max={product.stock}
                            />
                            <Button
                                variant="contained"
                                startIcon={<CartIcon />}
                                onClick={handleAddToCart}
                                disabled={actionLoading.cart || product.stock === 0}
                                sx={{ flex: 1 }}
                            >
                                {actionLoading.cart ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Add to Cart'
                                )}
                            </Button>
                            <IconButton 
                                onClick={handleWishlistToggle}
                                disabled={actionLoading.wishlist}
                                color={isInWishlist(product._id) ? 'primary' : 'default'}
                            >
                                {actionLoading.wishlist ? (
                                    <CircularProgress size={24} />
                                ) : isInWishlist(product._id) ? (
                                    <FavoriteIcon />
                                ) : (
                                    <FavoriteBorderIcon />
                                )}
                            </IconButton>
                        </Box>

                        {/* Shipping Info */}
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShippingIcon color="primary" />
                                <Typography variant="body2">
                                    Free shipping on orders over $50
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            {/* Product Details Tabs */}
            <Box sx={{ mt: 6 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons={isMobile ? "auto" : false}
                >
                    <Tab 
                        icon={<DescriptionIcon />} 
                        label="Description" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<SpecsIcon />} 
                        label="Specifications" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<ReviewsIcon />} 
                        label="Reviews" 
                        iconPosition="start"
                    />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    <Typography variant="body1">
                        {product.description}
                    </Typography>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <Grid container spacing={2}>
                        {product.specifications?.map((spec, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Paper sx={{ p: 2 }}>
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
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <ReviewSection productId={id} />
                </TabPanel>
            </Box>

            {/* Related Products */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom>
                    Related Products
                </Typography>
                <RelatedProducts 
                    categoryId={product.category} 
                    currentProductId={product._id}
                />
            </Box>
        </Container>
    );
};

export default ProductDetails;
