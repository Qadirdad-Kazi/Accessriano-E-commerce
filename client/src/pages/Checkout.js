import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Box,
  CircularProgress,
  Divider
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axios';

const Checkout = () => {
  const { cart, clearCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
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
    return cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2);
  };

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.warning('Please login to complete your purchase');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Validate shipping address
      for (const [key, value] of Object.entries(shippingAddress)) {
        if (!value.trim()) {
          throw new Error(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
        }
      }

      // Validate cart
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Your cart is empty');
      }

      const orderPayload = {
        products: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: parseFloat(calculateTotal()),
        shippingAddress,
        paymentMethod: 'cod'
      };

      const response = await axiosInstance.post('/orders', orderPayload);
      
      if (response.data.success) {
        const orderId = response.data.data._id;
        
        // Clear cart after successful order
        await clearCart();
        toast.success('Order placed successfully!');
        
        // Navigate to order confirmation
        navigate('/orders', { 
          state: { 
            newOrderId: orderId,
            message: 'Order placed successfully!'
          } 
        });
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Grid container spacing={3}>
        {/* Shipping Address Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Street Address"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="City"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="State"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Postal Code"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Box sx={{ my: 2 }}>
              {cart.items.map((item) => (
                <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${calculateTotal()}</Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleSubmit}
              disabled={loading || cart.items.length === 0}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
