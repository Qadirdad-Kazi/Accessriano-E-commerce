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
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders');
      console.log('Orders data:', JSON.stringify(response.data, null, 2));
      
      // Transform the orders data to ensure product information is preserved
      const transformedOrders = (response.data.data || []).map(order => {
        console.log('Processing order:', order._id, 'Products:', order.products);
        return {
          ...order,
          products: order.products.map(item => {
            console.log('Processing product:', item.product);
            return {
              ...item,
              product: item.product || {
                _id: 'deleted',
                name: 'Product No Longer Available',
                price: item.price,
                images: []
              }
            };
          })
        };
      });
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (order, item) => {
    console.log('Review click - Order:', order._id, 'Product:', item.product);
    
    // Check if product is deleted or unavailable
    if (!item.product || item.product._id === 'deleted') {
      toast.error('This product is no longer available for review.');
      return;
    }
    
    setReviewProduct({
      orderId: order._id,
      productId: item.product._id,
      name: item.product.name,
      reviewed: item.reviewed
    });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (!reviewProduct?.productId) {
        toast.error('Product information is missing. Please try again.');
        return;
      }

      const reviewPayload = {
        productId: reviewProduct.productId,
        rating: reviewData.rating,
        title: reviewData.review.slice(0, 50), // Use first 50 chars as title
        content: reviewData.review,
        order: reviewProduct.orderId
      };

      console.log('Submitting review with payload:', reviewPayload);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to submit a review');
        return;
      }

      const response = await api.post('/reviews', reviewPayload);
      
      if (response.data.success) {
        // Update the local state to mark the product as reviewed
        setOrders(orders.map(order => {
          if (order._id === reviewProduct.orderId) {
            return {
              ...order,
              products: order.products.map(item => {
                if (item.product?._id === reviewProduct.productId) {
                  return { ...item, reviewed: true };
                }
                return item;
              })
            };
          }
          return order;
        }));

        setReviewModalOpen(false);
        setReviewProduct(null);
        toast.success('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit review. Please try again.';
      
      if (error.response?.status === 403) {
        toast.error('You can only review products you have purchased and received');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to submit a review');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleReviewClose = () => {
    setReviewModalOpen(false);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      
      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        </Paper>
      )}
      
      {!loading && !error && orders.length === 0 ? (
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
        <>
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
                              {order.products.map((item, index) => (
                                <TableRow key={item.product?._id || index}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <img
                                        src={item.product?.images?.[0] || '/placeholder-image.jpg'}
                                        alt={item.product?.name || 'Product Image'}
                                        style={{
                                          width: 50,
                                          height: 50,
                                          objectFit: 'cover',
                                          marginRight: theme.spacing(2),
                                          borderRadius: theme.shape.borderRadius,
                                        }}
                                      />
                                      <Typography variant="body2">
                                        {item.product?.name || 'Product No Longer Available'}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">${item.price?.toFixed(2) || '0.00'}</TableCell>
                                  <TableCell align="right">{item.quantity || 0}</TableCell>
                                  <TableCell align="right">
                                    ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box>
                                      <Typography variant="caption" display="block" gutterBottom>
                                        Status: {order.status}
                                      </Typography>
                                      {order.status === 'delivered' && (
                                        item.product && item.product._id !== 'deleted' ? (
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleReviewClick(order, item)}
                                            disabled={item.reviewed}
                                          >
                                            {item.reviewed ? 'Reviewed' : 'Write Review'}
                                          </Button>
                                        ) : (
                                          <Typography variant="caption" color="textSecondary">
                                            Product no longer available for review
                                          </Typography>
                                        )
                                      )}
                                      {order.status !== 'delivered' && (
                                        <Typography variant="caption" color="textSecondary">
                                          Reviews available after delivery
                                        </Typography>
                                      )}
                                    </Box>
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
          
          <ReviewForm
            open={reviewModalOpen}
            onClose={handleReviewClose}
            onSubmit={handleReviewSubmit}
            productName={reviewProduct?.name}
          />
        </>
      )}
    </Container>
  );
};

export default Orders;
