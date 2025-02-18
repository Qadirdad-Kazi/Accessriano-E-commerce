import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleReviewClick = (order, product) => {
    setReviewProduct({
      orderId: order._id,
      productId: product.product._id,
      name: product.product.name,
      reviewed: product.reviewed
    });
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await api.post('/reviews', {
        ...reviewData,
        product: reviewProduct.productId,
        order: reviewProduct.orderId
      });
      setReviewProduct(null);
      fetchOrders(); // Refresh orders to update review status
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  const formatDate = (date) => {
    return format(new Date(date), 'PPP');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No orders found
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Order #{order._id.slice(-8)}
                    </Typography>
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status)}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="right">Price</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Total</TableCell>
                              <TableCell align="right">Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.products.map((item) => (
                              <TableRow key={item.product._id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                      src={item.product.images[0]}
                                      alt={item.product.name}
                                      style={{
                                        width: 50,
                                        height: 50,
                                        objectFit: 'cover',
                                        marginRight: theme.spacing(2),
                                        borderRadius: theme.shape.borderRadius,
                                      }}
                                    />
                                    <Typography variant="body2">
                                      {item.product.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">${item.price}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                  {order.status === 'delivered' && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleReviewClick(order, item)}
                                      disabled={item.reviewed}
                                    >
                                      {item.reviewed ? 'Reviewed' : 'Write Review'}
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Order Summary
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Order Date:</Typography>
                            <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Total Amount:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              ${order.totalAmount.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Payment Status:</Typography>
                            <Chip
                              size="small"
                              label={order.paymentStatus.toUpperCase()}
                              color={order.paymentStatus === 'completed' ? 'success' : 'warning'}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Review Dialog */}
      <Dialog
        open={Boolean(reviewProduct)}
        onClose={() => setReviewProduct(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          {reviewProduct && (
            <ReviewForm
              productName={reviewProduct.name}
              onSubmit={handleReviewSubmit}
              onCancel={() => setReviewProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Orders;
