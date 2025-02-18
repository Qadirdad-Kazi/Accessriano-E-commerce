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
import axiosInstance from '../../utils/axios';
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
                setError(null);
                
                const response = await axiosInstance.get(`/products/related/${productId}`, {
                    params: {
                        limit: 8,
                        category
                    }
                });
                
                if (response.data.success) {
                    // Filter out the current product if it's in the results
                    const filteredProducts = response.data.data.filter(
                        product => product._id !== productId
                    );
                    setProducts(filteredProducts);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch related products');
                }
            } catch (error) {
                console.error('Error fetching related products:', error);
                setError(error.message || 'Failed to fetch related products');
                setProducts([]);
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
                <Typography variant="h6" gutterBottom>
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
                <Typography variant="h6" gutterBottom>
                    Related Products
                </Typography>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!products || products.length === 0) {
        return null; // Don't show anything if no related products
    }

    const visibleProducts = products.slice(
        currentSlide * itemsPerSlide,
        (currentSlide * itemsPerSlide) + itemsPerSlide
    );

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                    Related Products
                </Typography>
                {products.length > itemsPerSlide && (
                    <Box>
                        <IconButton 
                            onClick={handlePrevSlide}
                            disabled={currentSlide === 0}
                            size="small"
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                        <IconButton 
                            onClick={handleNextSlide}
                            disabled={currentSlide >= Math.ceil(products.length / itemsPerSlide) - 1}
                            size="small"
                        >
                            <ChevronRightIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Grid container spacing={2}>
                {visibleProducts.map((product) => (
                    <Grid item xs={6} md={3} key={product._id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default RelatedProducts;
