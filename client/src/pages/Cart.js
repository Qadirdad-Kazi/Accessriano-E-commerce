import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, IconButton, TextField, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Your Cart
      </Typography>
      {cart.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <List>
          {cart.map(item => (
            <ListItem key={item.product._id} divider>
              <ListItemText
                primary={item.product.name}
                secondary={`Price: $${item.product.price}`}
              />
              <TextField
                type="number"
                label="Quantity"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.product._id, e)}
                InputProps={{ inputProps: { min: 1 } }}
                sx={{ width: '80px', mr: 2 }}
              />
              <IconButton onClick={() => removeFromCart(item.product._id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5">Total: ${calculateTotal()}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>
      </Box>
    </Container>
  );
};

export default Cart;
