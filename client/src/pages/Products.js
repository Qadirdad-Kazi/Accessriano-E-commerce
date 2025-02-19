import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import api from '../utils/api';

const MotionCard = motion(Card);

const Products = ({ admin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const categoryFromUrl = searchParams.get('category');

  useEffect(() => {
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        if (response.data.success) {
          setCategories(response.data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/products', {
          params: {
            page,
            limit: 12,
            sortBy,
            sortOrder,
            category: category || undefined,
            search: searchQuery || undefined,
          },
        });

        if (response.data.success) {
          setProducts(response.data.products || []);
          setTotalPages(Math.ceil((response.data.total || 0) / 12));
        } else {
          setProducts([]);
          setTotalPages(1);
          setError(response.data.message || 'Failed to fetch products');
        }
      } catch (error) {
        setError('Failed to fetch products. Please try again later.');
        console.error('Error fetching products:', error);
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, sortBy, sortOrder, category, searchQuery]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleProductClick = (productId) => {
    if (admin) {
      navigate(`/admin/product/edit/${productId}`);
    } else {
      navigate(`/product/${productId}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Filters and Search */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {(categories || []).map((cat) => (
                  <MenuItem key={cat.name} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="createdAt">Date Added</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={sortOrder}
                label="Order"
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Search Products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
              <MotionCard
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                sx={{ height: '100%', cursor: 'pointer' }}
                onClick={() => handleProductClick(product._id)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images[0]}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.category}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    Rs. {product.price.toLocaleString()}
                  </Typography>
                  {product.stock <= 0 && (
                    <Typography variant="body2" color="error">
                      Out of Stock
                    </Typography>
                  )}
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default Products;
