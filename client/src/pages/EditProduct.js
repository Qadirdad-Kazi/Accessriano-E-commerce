import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, TextField, Button, CircularProgress, Typography } from '@mui/material';
import { toast } from 'react-toastify';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(response => setProduct(response.data.data))
      .catch(() => toast.error('Failed to fetch product details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };

      await axios.put(`http://localhost:5000/api/products/${id}`, product, config);
      toast.success("Product updated successfully!");
      navigate('/admin');
    } catch {
      toast.error("Failed to update product.");
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4">Edit Product</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="name" fullWidth value={product.name} onChange={handleChange} />
        <TextField label="Description" name="description" fullWidth value={product.description} onChange={handleChange} />
        <TextField label="Price" name="price" type="number" fullWidth value={product.price} onChange={handleChange} />
        <Button type="submit" variant="contained">Update Product</Button>
      </form>
    </Container>
  );
};

export default EditProduct;
