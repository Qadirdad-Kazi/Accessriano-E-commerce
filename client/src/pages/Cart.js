import React from 'react';
import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  TextField, 
  Button, 
  Box, 
  Avatar,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cart, loading, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const calculateTotal = () => {
    return cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2);
  };

  const getProductImage = (product) => {
    return product.productImageUrl || product.qrImageUrl || "https://via.placeholder.com/80?text=No+Image";
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      {cart.items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Cart Items */}
          <Box sx={{ flex: 1 }}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {cart.items.map(item => (
                <ListItem 
                  key={item.product._id} 
                  sx={{
                    display: 'flex',
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <Avatar
                    variant="square"
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {item.product.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        ${item.product.price.toFixed(2)}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                      type="number"
                      label="Qty"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.product._id, e)}
                      InputProps={{ 
                        inputProps: { min: 1 },
                        sx: { width: '70px' }
                      }}
                      size="small"
                    />
                    <Typography variant="subtitle1" sx={{ minWidth: '80px', textAlign: 'right' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton 
                      onClick={() => removeFromCart(item.product._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Order Summary */}
          <Box sx={{ width: { xs: '100%', md: '300px' } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${calculateTotal()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping:</Typography>
                  <Typography>Free</Typography>
                </Box>
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
                onClick={handleCheckout}
                startIcon={<ShoppingCartCheckoutIcon />}
              >
                Proceed to Checkout
              </Button>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Cart;
