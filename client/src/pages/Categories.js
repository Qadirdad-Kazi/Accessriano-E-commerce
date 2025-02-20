import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Skeleton, CardActionArea } from '@mui/material';
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
            const response = await api.get('/categories');
            
            if (response.data.success && response.data.data.length > 0) {
                setCategories(response.data.data);
            } else {
                console.warn('No categories found');
                setCategories([]);
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
    return <Skeleton height={100} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Product Categories</Typography>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Card>
              <CardActionArea component={Link} to={`/categories/${category._id}/products`}>
                <CardContent>
                  <Typography variant="h6">{category.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{category.description}</Typography>
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
