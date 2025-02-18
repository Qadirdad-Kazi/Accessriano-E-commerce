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
import api from '../utils/api';
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
                const response = await api.get(`/products/${id}`);
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
            navigate('/login');
            return;
        }

        if (!product?.stock) {
            toast.error('Product is out of stock');
            return;
        }

        setActionLoading(prev => ({ ...prev, cart: true }));
        try {
            await addToCart(product._id, quantity);
        } finally {
            setActionLoading(prev => ({ ...prev, cart: false }));
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
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
        } finally {
            setActionLoading(prev => ({ ...prev, wishlist: false }));
        }
    };

    const handleShareClick = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton variant="text" height={40} />
                        <Skeleton variant="text" height={30} width="60%" />
                        <Skeleton variant="text" height={60} />
                        <Skeleton variant="rectangular" height={100} />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">Product not found</Alert>
            </Container>
        );
    }

    const isProductInWishlist = isInWishlist(product._id);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Product Images */}
                <Grid item xs={12} md={6}>
                    <ImageGallery images={product.images || []} />
                </Grid>

                {/* Product Info */}
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={product.rating || 0} readOnly precision={0.5} />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({product.numReviews || 0} reviews)
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h4" color="primary" component="div">
                                {formatPrice(product.discountPrice || product.price)}
                            </Typography>
                            {product.discountPrice && (
                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    sx={{ ml: 2, textDecoration: 'line-through' }}
                                >
                                    {formatPrice(product.price)}
                                </Typography>
                            )}
                            {product.onSale && (
                                <Chip
                                    label={`${product.discountPercentage}% OFF`}
                                    color="error"
                                    size="small"
                                    sx={{ ml: 2 }}
                                />
                            )}
                        </Box>

                        {/* Stock Status */}
                        <Box sx={{ mb: 3 }}>
                            <Chip
                                label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                color={product.stock > 0 ? 'success' : 'error'}
                                variant="outlined"
                            />
                            {product.stock > 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {product.stock} units available
                                </Typography>
                            )}
                        </Box>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <ProductVariants
                                    variants={product.variants}
                                    selectedVariant={selectedVariant}
                                    onVariantChange={handleVariantChange}
                                />
                            </Box>
                        )}

                        {/* Quantity Selector */}
                        <Box sx={{ mb: 3 }}>
                            <QuantitySelector
                                quantity={quantity}
                                onChange={handleQuantityChange}
                                max={product.stock}
                            />
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={actionLoading.cart ? <CircularProgress size={20} /> : <CartIcon />}
                                onClick={handleAddToCart}
                                disabled={!product.stock || actionLoading.cart}
                                sx={{ flex: 1 }}
                            >
                                Add to Cart
                            </Button>

                            <IconButton
                                color={isProductInWishlist ? 'error' : 'default'}
                                onClick={handleWishlistToggle}
                                disabled={actionLoading.wishlist}
                                sx={{ border: 1, borderColor: 'divider' }}
                            >
                                {actionLoading.wishlist ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    isProductInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />
                                )}
                            </IconButton>

                            <IconButton
                                onClick={handleShareClick}
                                sx={{ border: 1, borderColor: 'divider' }}
                            >
                                <ShareIcon />
                            </IconButton>
                        </Box>

                        {/* Product Information Tabs */}
                        <Box sx={{ width: '100%', mb: 3 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab icon={<DescriptionIcon />} label="Description" />
                                <Tab icon={<SpecsIcon />} label="Specifications" />
                                <Tab icon={<ShippingIcon />} label="Shipping" />
                            </Tabs>
                            <Box sx={{ p: 2, border: 1, borderColor: 'divider', mt: 2 }}>
                                {activeTab === 0 && (
                                    <Typography variant="body1">{product.description}</Typography>
                                )}
                                {activeTab === 1 && (
                                    <Box>
                                        {product.specifications?.map((spec, index) => (
                                            <Box key={index} sx={{ mb: 1 }}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {spec.name}
                                                </Typography>
                                                <Typography variant="body1">{spec.value}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                {activeTab === 2 && (
                                    <Box>
                                        <Typography variant="body1" paragraph>
                                            Free shipping on orders over $50
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Estimated delivery: 3-5 business days
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Reviews Section */}
            <Box sx={{ mt: 6 }}>
                <ReviewSection productId={id} />
            </Box>

            {/* Related Products */}
            <Box sx={{ mt: 6 }}>
                <RelatedProducts productId={id} category={product.category} />
            </Box>
        </Container>
    );
};

export default ProductDetails;
