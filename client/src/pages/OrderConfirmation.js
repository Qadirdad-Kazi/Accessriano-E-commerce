import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
  // Optionally, you can pass order details via location state
  const location = useLocation();
  const orderDetails = location.state?.order || null; // This assumes you pass order details when navigating

  return (
    <Container>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Order Confirmed!
        </Typography>
        <Typography variant="h6">
          Thank you for your purchase. Your order has been placed successfully.
        </Typography>
        {orderDetails && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Order ID: {orderDetails._id}</Typography>
            <Typography variant="body1">Total Amount: ${orderDetails.totalAmount}</Typography>
            {/* You can display additional details as needed */}
          </Box>
        )}
        {!orderDetails && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            (Order details are not available in this demo.)
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default OrderConfirmation;
