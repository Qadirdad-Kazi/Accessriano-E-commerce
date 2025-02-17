import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery,
    Skeleton,
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import axios from 'axios';
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
            try {
                const response = await axios.get(`/api/search/related/${productId}`);
                setProducts(response.data.data);
            } catch (error) {
                console.error('Error fetching related products:', error);
                setError(error.response?.data?.message || 'Failed to fetch related products');
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [productId]);

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
            <Grid container spacing={2}>
                {[...Array(4)].map((_, index) => (
                    <Grid item xs={6} md={3} key={index}>
                        <Skeleton variant="rectangular" height={200} />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (error) {
        return (
            <Typography color="error">
                {error}
            </Typography>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <Box sx={{ position: 'relative' }}>
            <Box
                sx={{
                    display: 'flex',
                    overflow: 'hidden',
                    position: 'relative',
                    mx: { xs: -2, md: 0 },
                    px: { xs: 2, md: 0 },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        transition: 'transform 0.3s ease-in-out',
                        transform: `translateX(-${currentSlide * 100}%)`,
                        gap: 2,
                    }}
                >
                    {products.map((product) => (
                        <Box
                            key={product._id}
                            sx={{
                                flex: `0 0 ${100 / itemsPerSlide}%`,
                                maxWidth: `${100 / itemsPerSlide}%`,
                            }}
                        >
                            <ProductCard product={product} />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Navigation Arrows */}
            {products.length > itemsPerSlide && (
                <>
                    <IconButton
                        onClick={handlePrevSlide}
                        disabled={currentSlide === 0}
                        sx={{
                            position: 'absolute',
                            left: -20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': { bgcolor: 'background.paper' },
                            display: { xs: 'none', md: 'flex' },
                        }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleNextSlide}
                        disabled={currentSlide >= Math.ceil(products.length / itemsPerSlide) - 1}
                        sx={{
                            position: 'absolute',
                            right: -20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': { bgcolor: 'background.paper' },
                            display: { xs: 'none', md: 'flex' },
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                </>
            )}

            {/* Mobile Pagination Dots */}
            {isMobile && products.length > itemsPerSlide && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 2,
                        gap: 1,
                    }}
                >
                    {[...Array(Math.ceil(products.length / itemsPerSlide))].map((_, index) => (
                        <Box
                            key={index}
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: currentSlide === index ? 'primary.main' : 'grey.300',
                                transition: 'background-color 0.3s',
                            }}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default RelatedProducts;
