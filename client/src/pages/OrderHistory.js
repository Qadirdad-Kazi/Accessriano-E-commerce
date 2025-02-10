import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // If no token is found, redirect to login page
          navigate('/login');
          return;
        }
        const config = {
          headers: { 'x-auth-token': token },
        };
        const response = await axios.get('http://localhost:5000/api/orders', config);
        setOrders(response.data.data);
      } catch (error) {
        console.error('Error fetching order history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Your Order History
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="body1">You have no past orders.</Typography>
      ) : (
        <List>
          {orders.map(order => (
            <React.Fragment key={order._id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`Order ID: ${order._id}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Total: ${order.totalAmount}
                      </Typography>
                      {` — Status: ${order.status}`}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Container>
  );
};

export default OrderHistory;
