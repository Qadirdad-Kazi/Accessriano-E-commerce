import React, { useState } from 'react';
import { Container, TextField, Typography, Button, Grid, Paper, Box } from '@mui/material';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(false);

  // Calculate the total amount from the cart items
  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate shipping address
    for (const [key, value] of Object.entries(shippingAddress)) {
      if (!value.trim()) {
        toast.error(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
        setLoading(false);
        return;
      }
    }

    // Validate cart
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to place an order');
        navigate('/login');
        return;
      }

      const orderPayload = {
        products: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: calculateTotal(),
        shippingAddress,
        paymentMethod: 'cod'
      };

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.post('http://localhost:5000/api/orders', orderPayload, config);
      
      if (response.data.success) {
        const orderId = response.data.data._id;
        
        // Only clear cart and navigate after successful order
        clearCart();
        toast.success('Order placed successfully!');
        
        // Navigate to order confirmation with order details
        navigate('/order-confirmation', { 
          state: { 
            orderId,
            orderNumber: orderId.slice(-6).toUpperCase(),
            totalAmount: orderPayload.totalAmount,
            shippingAddress
          } 
        });
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>Checkout</Typography>
      <Paper sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Shipping Information</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                label="Street Address"
                name="street"
                fullWidth
                value={shippingAddress.street}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="City"
                name="city"
                fullWidth
                value={shippingAddress.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="State/Province"
                name="state"
                fullWidth
                value={shippingAddress.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Postal Code"
                name="postalCode"
                fullWidth
                value={shippingAddress.postalCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Country"
                name="country"
                fullWidth
                value={shippingAddress.country}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            {cart.map((item) => (
              <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                <Typography>{item.product.name} x {item.quantity}</Typography>
                <Typography>${(item.product.price * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>

          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            disabled={loading || cart.length === 0}
            sx={{ mt: 3 }}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Checkout;
