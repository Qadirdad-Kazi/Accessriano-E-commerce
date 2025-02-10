import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Typography } from '@mui/material';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Home = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(response => {
        setProducts(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  return (
    <Container>
      <LanguageSwitcher />
      <Typography variant="h4" gutterBottom>{t('featured_products')}</Typography>
      <Grid container spacing={3}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
