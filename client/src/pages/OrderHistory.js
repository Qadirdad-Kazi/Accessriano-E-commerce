import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { RateReview as RateReviewIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReviewForm from '../components/ReviewForm';

// Status color mapping
const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  failed: 'error',
  completed: 'success'
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [reviewProduct, setReviewProduct] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view your orders');
        navigate('/login');
        return;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:5000/api/orders', config);
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleReviewClick = (order, product) => {
    setReviewProduct({
      productId: product._id,
      orderId: order._id,
      productName: product.name,
      productImage: product.images[0]
    });
  };

  const handleReviewSubmitted = () => {
    setReviewProduct(null);
    fetchOrders(); // Refresh orders to update review status
    toast.success('Thank you for your review!');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Your Orders</Typography>
        <Tooltip title="Refresh Orders">
          <IconButton onClick={fetchOrders} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>You have no orders yet.</Typography>
        </Paper>
      ) : (
        orders.map((order) => (
          <Paper key={order._id} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  Order #{order._id.slice(-6).toUpperCase()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {order._id}
                </Typography>
              </Box>
              <Box>
                <Chip
                  label={`Payment: ${order.paymentStatus}`}
                  color={order.paymentStatus === 'completed' ? 'success' : 'warning'}
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Order: ${order.status}`}
                  color={STATUS_COLORS[order.status]}
                />
              </Box>
            </Box>
            
            <Typography color="text.secondary" gutterBottom>
              Placed on {formatDate(order.createdAt)}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {order.products.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.product._id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.product.images[0]}
                      alt={item.product.name}
                      sx={{ objectFit: 'contain' }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price: ${item.price.toFixed(2)}
                      </Typography>
                      
                      {order.status === 'delivered' && order.paymentStatus === 'completed' && (
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title={
                            item.reviewed 
                              ? 'You have already reviewed this product'
                              : order.paymentStatus !== 'completed'
                                ? 'Payment must be completed before reviewing'
                                : order.status !== 'delivered'
                                  ? 'Order must be delivered before reviewing'
                                  : 'Write a review for this product'
                          }>
                            <span>
                              <Button
                                size="small"
                                startIcon={<RateReviewIcon />}
                                onClick={() => {
                                  console.log('Review click - Order:', {
                                    orderId: order._id,
                                    status: order.status,
                                    payment: order.paymentStatus
                                  });
                                  console.log('Review click - Product:', {
                                    productId: item.product._id,
                                    name: item.product.name,
                                    reviewed: item.reviewed
                                  });
                                  handleReviewClick(order, item.product);
                                }}
                                disabled={item.reviewed}
                                color={item.reviewed ? 'success' : 'primary'}
                              >
                                {item.reviewed ? 'Reviewed' : 'Write Review'}
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 2, borderTop: 1, pt: 2, borderColor: 'divider' }}>
              <Typography variant="subtitle1" align="right">
                Total: ${order.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        ))
      )}

      {/* Review Dialog */}
      <Dialog 
        open={!!reviewProduct} 
        onClose={() => setReviewProduct(null)}
        maxWidth="sm"
        fullWidth
      >
        {reviewProduct && (
          <>
            <DialogTitle>
              Review for {reviewProduct.productName}
            </DialogTitle>
            <DialogContent>
              <ReviewForm
                productId={reviewProduct.productId}
                orderId={reviewProduct.orderId}
                onReviewSubmitted={handleReviewSubmitted}
                onClose={() => setReviewProduct(null)}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default OrderHistory;
