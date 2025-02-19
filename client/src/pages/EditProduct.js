import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Grid,
  MenuItem,
  Alert,
  Paper,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../utils/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/products/categories')
        ]);

        if (productRes.data.success) {
          setProduct(productRes.data.data);
        } else {
          setError('Failed to fetch product details');
        }

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.categories);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        toast.error('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Append product data
      Object.keys(product).forEach(key => {
        if (key !== 'images' && product[key] !== null && product[key] !== undefined) {
          formData.append(key, product[key]);
        }
      });

      // Append new images if any
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        toast.success('Product updated successfully!');
        navigate('/admin');
      } else {
        setError(response.data.message || 'Failed to update product');
        toast.error(response.data.message || 'Failed to update product');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update product';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Alert severity="error">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Product
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Product Name"
                name="name"
                value={product.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="SKU"
                name="sku"
                value={product.sku}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={product.price}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={product.stock}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={product.brand}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Category"
                name="category"
                value={product.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category.name} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={product.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                type="file"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span" fullWidth>
                  Upload New Images
                </Button>
              </label>
            </Grid>
            {product.images && product.images.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Images:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {product.images.map((image, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={image}
                      alt={`Product ${index + 1}`}
                      sx={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/products')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Product'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditProduct;
