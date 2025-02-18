import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Typography, CircularProgress, Box } from '@mui/material';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/HeroSection';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SearchBar from '../components/SearchBar';
import API_BASE_URL from '../config';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        setProducts(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error?.message || 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <HeroSection />
      <Box py={4}>
        <LanguageSwitcher />
        <Box display="flex" justifyContent="center" sx={{ mt: 3, mb: 3 }}> 
          <SearchBar />  {/* ✅ Moved SearchBar to Home.js */}
        </Box>
        <Typography variant="h4" gutterBottom align="center">Welcome to Accessriano</Typography>
        <Typography variant="h5" gutterBottom align="center">Featured Products</Typography>
        <Grid container spacing={3}>
          {products.length > 0 ? (
            products.map(product => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Typography variant="h6" align="center">No products available</Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
