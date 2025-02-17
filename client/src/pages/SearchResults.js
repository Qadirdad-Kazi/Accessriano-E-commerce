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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    FilterList as FilterListIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchFilters from '../components/SearchFilters';
import ProductCard from '../components/ProductCard';
import { useQueryParams } from '../hooks/useQueryParams';

const API_BASE_URL = 'https://example.com/api'; // Replace with your API base URL
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

    // Fetch products based on filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`${API_BASE_URL}/products/search/${encodeURIComponent(selectedFilters.query)}`, {
                    params: {
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
                
                setProducts(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Search error:', error);
                setError(error.response?.data?.message || 'Error searching products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedFilters]);

    const handleFilterChange = (newFilters) => {
        setSelectedFilters(prev => ({
            ...prev,
            ...newFilters,
            page: 1 // Reset to first page when filters change
        }));

        // Update URL with new filters
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                if (key === 'price') {
                    if (value.min) params.append('minPrice', value.min);
                    if (value.max) params.append('maxPrice', value.max);
                } else if (key === 'tags' && Array.isArray(value)) {
                    params.append('tags', value.join(','));
                } else {
                    params.append(key, value);
                }
            }
        });
        
        navigate(`/search?${params.toString()}`);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Mobile Filters Toggle */}
            {isMobile && (
                <Button
                    startIcon={<FilterListIcon />}
                    onClick={() => setMobileFiltersOpen(true)}
                    sx={{ mb: 2 }}
                >
                    Filters
                </Button>
            )}

            <Grid container spacing={3}>
                {/* Filters Section */}
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
                        onClose={() => setMobileFiltersOpen(false)}
                    >
                        <Box sx={{ width: 250, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Filters</Typography>
                                <IconButton onClick={() => setMobileFiltersOpen(false)}>
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

                {/* Results Section */}
                <Grid item xs={12} md={9}>
                    {/* Sort and Results Count */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography>
                            {loading ? 'Searching...' : 
                             error ? 'Error loading results' :
                             `${products.length} results found`}
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={selectedFilters.sortBy}
                                label="Sort By"
                                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                            >
                                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Error Message */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Products Grid */}
                    <Grid container spacing={3}>
                        {products.map((product) => (
                            <Grid item xs={12} sm={6} md={4} key={product._id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                    </Grid>

                    {/* No Results Message */}
                    {!loading && !error && products.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                No products found
                            </Typography>
                            <Typography color="text.secondary">
                                Try adjusting your search or filters
                            </Typography>
                        </Box>
                    )}

                    {/* Pagination */}
                    {products.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={Math.ceil(products.length / 12)}
                                page={selectedFilters.page}
                                onChange={(_, page) => handleFilterChange({ page })}
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
