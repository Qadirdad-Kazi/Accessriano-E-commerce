import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Box,
  Skeleton,
  CardActionArea
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const response = await api.get('/products/categories');
        console.log('Categories response:', response.data);
        
        if (response.data.success) {
          setCategories(response.data.categories);
        } else {
          throw new Error(response.data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Product Categories
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((skeleton) => (
            <Grid item xs={12} sm={6} md={4} key={skeleton}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box 
          sx={{ 
            mt: 4, 
            textAlign: 'center',
            p: 3,
            bgcolor: 'error.light',
            borderRadius: 1
          }}
        >
          <Typography color="error.dark" variant="h6">
            {error}
          </Typography>
          <Typography color="error.dark" variant="body2" sx={{ mt: 1 }}>
            Please try refreshing the page or contact support if the problem persists.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">
            No categories found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please check back later for updates to our product catalog.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Product Categories
      </Typography>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.name}>
            <Card>
              <CardActionArea 
                component={Link} 
                to={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {category.name}
                  </Typography>
                  {category.count && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {category.count} {category.count === 1 ? 'product' : 'products'}
                    </Typography>
                  )}
                  {category.description && (
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Categories;
