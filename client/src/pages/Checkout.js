import React, { useState } from 'react';
import { Container, TextField, Typography, Button, Grid, Paper, Box } from '@mui/material';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [error, setError] = useState('');

  // Calculate the total amount from the cart items
  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct order payload
    const orderPayload = {
      products: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount: calculateTotal(),
      shippingInfo,
    };

    try {
      const token = localStorage.getItem('token'); // Make sure user is logged in
      const config = {
        headers: { 'x-auth-token': token },
      };

      // Post the order to your backend endpoint
      const response = await axios.post('http://localhost:5000/api/orders', orderPayload, config);
      console.log('Order created:', response.data);
      // On success, navigate to an order confirmation page or home page
      navigate('/order-confirmation');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Checkout</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ padding: 2, mb: 3 }}>
        <Typography variant="h6">Shipping Information</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="fullName"
                fullWidth
                value={shippingInfo.fullName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                fullWidth
                value={shippingInfo.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="City"
                name="city"
                fullWidth
                value={shippingInfo.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Postal Code"
                name="postalCode"
                fullWidth
                value={shippingInfo.postalCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Country"
                name="country"
                fullWidth
                value={shippingInfo.country}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Order Summary</Typography>
            {cart.map((item) => (
              <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography>{item.product.name} x {item.quantity}</Typography>
                <Typography>${item.product.price * item.quantity}</Typography>
              </Box>
            ))}
            <Typography variant="h6" sx={{ mt: 2 }}>Total: ${calculateTotal()}</Typography>
          </Box>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
            Place Order
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Checkout;
