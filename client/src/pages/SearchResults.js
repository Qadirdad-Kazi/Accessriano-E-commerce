import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Box,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Pagination,
    Alert,
    Button,
    useMediaQuery,
    Drawer,
    IconButton,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    FilterList as FilterListIcon,
    Close as CloseIcon,
    SearchOff as SearchOffIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchFilters from '../components/SearchFilters';
import ProductCard from '../components/ProductCard';
import { useQueryParams } from '../hooks/useQueryParams';
import API_BASE_URL from '../config';

const SORT_OPTIONS = {
    'newest': 'Newest Arrivals',
    'price-asc': 'Price: Low to High',
    'price-desc': 'Price: High to Low',
    'rating-desc': 'Highest Rated',
    'popularity': 'Most Popular'
};

const SearchResults = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useQueryParams();

    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        categories: [],
        brands: [],
        tags: [],
        priceRange: { min: 0, max: 0 }
    });
    const [selectedFilters, setSelectedFilters] = useState({
        query: queryParams.get('q') || '',
        category: queryParams.get('category') || '',
        brand: queryParams.get('brand') || '',
        price: {
            min: queryParams.get('minPrice') || '',
            max: queryParams.get('maxPrice') || ''
        },
        rating: queryParams.get('rating') || '',
        tags: queryParams.get('tags')?.split(',').filter(Boolean) || [],
        inStock: queryParams.get('inStock') === 'true',
        sortBy: queryParams.get('sort') || 'newest',
        page: parseInt(queryParams.get('page')) || 1
    });
    const [pagination, setPagination] = useState({
        current: 1,
        total: 0,
        pages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Fetch available filters
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/products/filters`);
                setFilters(response.data);
            } catch (error) {
                console.error('Error fetching filters:', error);
                // Don't show error for filters, just log it
            }
        };
        fetchFilters();
    }, []);

    // Fetch products based on filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log('Fetching products with query:', selectedFilters.query);
                const response = await axios.get(`${API_BASE_URL}/products/search`, {
                    params: {
                        q: selectedFilters.query,
                        page: selectedFilters.page,
                        sortBy: selectedFilters.sortBy,
                        category: selectedFilters.category,
                        brand: selectedFilters.brand,
                        minPrice: selectedFilters.price.min,
                        maxPrice: selectedFilters.price.max,
                        minRating: selectedFilters.rating,
                        tags: selectedFilters.tags?.join(','),
                        inStock: selectedFilters.inStock
                    }
                });
                
                console.log('Search results:', response.data);
                setProducts(response.data.products || []);
                setPagination({
                    current: response.data.currentPage || 1,
                    total: response.data.total || 0,
                    pages: response.data.totalPages || 0
                });
            } catch (error) {
                console.error('Search error:', error);
                setError(
                    error.response?.data?.message || 
                    'Unable to fetch products. Please try again later.'
                );
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if there's a query
        if (selectedFilters.query) {
            fetchProducts();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [selectedFilters]);

    const handleFilterChange = (newFilters) => {
        setSelectedFilters(prev => ({
            ...prev,
            ...newFilters,
            page: 1 // Reset to first page when filters change
        }));

        // Update URL with new filters
        const searchParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                if (key === 'price') {
                    if (value.min) searchParams.set('minPrice', value.min);
                    if (value.max) searchParams.set('maxPrice', value.max);
                } else if (key === 'tags' && Array.isArray(value)) {
                    if (value.length) searchParams.set('tags', value.join(','));
                } else {
                    searchParams.set(key, value);
                }
            }
        });
        
        navigate({
            pathname: location.pathname,
            search: searchParams.toString()
        });
    };

    const handlePageChange = (event, newPage) => {
        handleFilterChange({ ...selectedFilters, page: newPage });
    };

    const toggleMobileFilters = () => {
        setMobileFiltersOpen(!mobileFiltersOpen);
    };

    if (loading) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 8 }}>
                <Alert severity="error" variant="filled">
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!selectedFilters.query) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    Enter a search term to find products
                </Typography>
            </Container>
        );
    }

    if (products.length === 0) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    No products found for "{selectedFilters.query}"
                </Typography>
                <Typography color="text.secondary" paragraph>
                    Try adjusting your search or filters to find what you're looking for.
                </Typography>
                {selectedFilters.category && (
                    <Button 
                        color="primary"
                        onClick={() => handleFilterChange({ ...selectedFilters, category: '' })}
                    >
                        Clear Category Filter
                    </Button>
                )}
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Mobile filter toggle */}
            {isMobile && (
                <Box sx={{ mb: 2 }}>
                    <Button
                        startIcon={<FilterListIcon />}
                        onClick={toggleMobileFilters}
                        variant="outlined"
                        fullWidth
                    >
                        Filters
                    </Button>
                </Box>
            )}

            <Grid container spacing={3}>
                {/* Filters */}
                {!isMobile ? (
                    <Grid item xs={12} md={3}>
                        <SearchFilters
                            filters={filters}
                            selected={selectedFilters}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                ) : (
                    <Drawer
                        anchor="left"
                        open={mobileFiltersOpen}
                        onClose={toggleMobileFilters}
                    >
                        <Box sx={{ width: 250, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Filters</Typography>
                                <IconButton onClick={toggleMobileFilters}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <SearchFilters
                                filters={filters}
                                selected={selectedFilters}
                                onChange={handleFilterChange}
                            />
                        </Box>
                    </Drawer>
                )}

                {/* Products */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" component="h1">
                            Search Results for "{selectedFilters.query}"
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={selectedFilters.sortBy}
                                label="Sort By"
                                onChange={(e) => handleFilterChange({ ...selectedFilters, sortBy: e.target.value })}
                            >
                                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Grid container spacing={3}>
                        {products.map((product) => (
                            <Grid item key={product._id} xs={12} sm={6} md={4}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>

                    {pagination.pages > 1 && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={pagination.pages}
                                page={pagination.current}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default SearchResults;
