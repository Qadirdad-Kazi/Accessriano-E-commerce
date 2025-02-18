import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery,
    Skeleton,
    Alert,
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import api from '../../utils/api';
import ProductCard from '../ProductCard';

const RelatedProducts = ({ productId, category }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const itemsPerSlide = isMobile ? 2 : 4;

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!productId) return;
            
            try {
                setLoading(true);
                const response = await api.get(`/products/related/${productId}`, {
                    params: {
                        limit: 8,
                        category
                    }
                });
                
                if (response.data.success) {
                    setProducts(response.data.data || []);
                } else {
                    setError('Failed to fetch related products');
                }
            } catch (error) {
                console.error('Error fetching related products:', error);
                setError(error.response?.data?.message || 'Failed to fetch related products');
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [productId, category]);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => Math.min(
            Math.ceil(products.length / itemsPerSlide) - 1,
            prev + 1
        ));
    };

    if (loading) {
        return (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Related Products
                </Typography>
                <Grid container spacing={2}>
                    {[...Array(4)].map((_, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Skeleton variant="rectangular" height={200} />
                            <Skeleton variant="text" />
                            <Skeleton variant="text" width="60%" />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Related Products
                </Typography>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!Array.isArray(products) || products.length === 0) {
        return null;
    }

    const visibleProducts = products.slice(
        currentSlide * itemsPerSlide,
        (currentSlide + 1) * itemsPerSlide
    );

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Related Products
            </Typography>
            
            <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0}
                    sx={{
                        position: 'absolute',
                        left: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'background.paper' },
                        display: { xs: 'none', md: 'flex' }
                    }}
                >
                    <ChevronLeftIcon />
                </IconButton>

                <Grid container spacing={2}>
                    {visibleProducts.map((product) => (
                        <Grid item xs={6} md={3} key={product._id}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>

                <IconButton
                    onClick={handleNextSlide}
                    disabled={currentSlide >= Math.ceil(products.length / itemsPerSlide) - 1}
                    sx={{
                        position: 'absolute',
                        right: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'background.paper' },
                        display: { xs: 'none', md: 'flex' }
                    }}
                >
                    <ChevronRightIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default RelatedProducts;
