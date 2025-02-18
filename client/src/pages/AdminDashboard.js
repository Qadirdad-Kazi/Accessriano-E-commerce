import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  TableContainer,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  Schedule as PendingIcon,
  Visibility as VisibilityIcon,
  RateReview as ReviewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnalyticsDashboard from './AnalyticsDashboard';
import API_BASE_URL from '../config';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed'];

const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  failed: 'error',
  completed: 'success'
};

const SummaryCard = ({ title, value, icon: Icon, color, secondaryText }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Icon sx={{ color, mr: 1 }} />
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      {secondaryText && (
        <Typography variant="body2" color="text.secondary">
          {secondaryText}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const OrderDetailsDialog = ({ open, order, onClose }) => {
  if (!order) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Order Details #{order._id.slice(-6).toUpperCase()}
          </Typography>
          <Chip 
            label={order.status} 
            color={STATUS_COLORS[order.status]}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
            <Typography variant="body2">
              Name: {order.user?.name || 'N/A'}<br />
              Email: {order.user?.email || 'N/A'}
            </Typography>
          </Grid>

          {/* Order Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Order Information</Typography>
            <Typography variant="body2">
              Date: {new Date(order.createdAt).toLocaleString()}<br />
              Payment Method: {order.paymentMethod}<br />
              Payment Status: <Chip 
                label={order.paymentStatus} 
                color={STATUS_COLORS[order.paymentStatus]}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>

          {/* Shipping Address */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Shipping Address</Typography>
            <Typography variant="body2">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}<br />
              {order.shippingAddress.country}, {order.shippingAddress.postalCode}
            </Typography>
          </Grid>

          {/* Order Total */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Order Summary</Typography>
            <Typography variant="body2">
              Subtotal: ${order.totalAmount.toFixed(2)}<br />
              Shipping: $0.00<br />
              <Box mt={1}>
                <Typography variant="subtitle2">
                  Total: ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Typography>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.products.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const navigate = useNavigate();
  const reviewsPerPage = 10;

  // Order summary calculations
  const getOrderSummary = () => {
    const pendingPayments = orders.filter(order => order.paymentStatus === 'pending');
    const pendingShipments = orders.filter(order => 
      ['pending', 'processing'].includes(order.status)
    );
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'completed')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    return {
      pendingPayments: pendingPayments.length,
      pendingShipments: pendingShipments.length,
      totalRevenue,
      pendingPaymentsAmount: pendingPayments.reduce((sum, order) => sum + order.totalAmount, 0)
    };
  };

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const res = await axios.get(`${API_BASE_URL}/products`, config);
      setProducts(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const res = await axios.get(`${API_BASE_URL}/orders`, config);
      setOrders(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    setReviewsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/reviews?page=${page}&limit=${reviewsPerPage}`, {
        headers: { 'x-auth-token': token }
      });
      setReviews(response.data.data);
      setReviewsTotal(response.data.pagination.total);
      setReviewsPage(page);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProducts(true);
      setLoadingOrders(true);
      await Promise.all([fetchProducts(), fetchOrders(), fetchReviews()]);
      setLoadingProducts(false);
      setLoadingOrders(false);
    };
    fetchData();
    // Poll for updates every 30 seconds
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      await axios.delete(`${API_BASE_URL}/products/${id}`, config);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

  // Delete Order
  const handleDeleteOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      await axios.delete(`${API_BASE_URL}/orders/${id}`, config);
      toast.success("Order deleted successfully!");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to delete order.");
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId, newStatus, type = 'status') => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };

      const update = type === 'status' 
        ? { status: newStatus }
        : { paymentStatus: newStatus };

      const response = await axios.put(
        `${API_BASE_URL}/orders/${orderId}`,
        update,
        config
      );

      if (response.data.success) {
        toast.success(`Order ${type} updated successfully`);
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, [type]: newStatus }
            : order
        ));
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(`Error updating order ${type}:`, error);
      toast.error(error.response?.data?.message || `Failed to update order ${type}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const summary = getOrderSummary();

  const handleReviewPageChange = (newPage) => {
    setReviewsPage(newPage);
  };

  const ReviewsTable = () => (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviewsLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.product?.name || 'N/A'}</TableCell>
                  <TableCell>{review.user?.name || 'N/A'}</TableCell>
                  <TableCell>{review.rating}</TableCell>
                  <TableCell>{review.comment}</TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/product/${review.productId}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {!reviewsLoading && reviews.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            disabled={reviewsPage === 1}
            onClick={() => handleReviewPageChange(reviewsPage - 1)}
          >
            Previous
          </Button>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            Page {reviewsPage} of {Math.ceil(reviewsTotal / reviewsPerPage)}
          </Typography>
          <Button
            disabled={reviewsPage >= Math.ceil(reviewsTotal / reviewsPerPage)}
            onClick={() => handleReviewPageChange(reviewsPage + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );

  useEffect(() => {
    if (tabIndex === 3) { // Reviews tab
      fetchReviews(reviewsPage);
    }
  }, [tabIndex, reviewsPage]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pending Payments"
            value={summary.pendingPayments}
            icon={PaymentIcon}
            color="#f44336"
            secondaryText={`$${summary.pendingPaymentsAmount.toFixed(2)} pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pending Shipments"
            value={summary.pendingShipments}
            icon={ShippingIcon}
            color="#2196f3"
            secondaryText="Orders awaiting shipment"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Revenue"
            value={`$${summary.totalRevenue.toFixed(2)}`}
            icon={MoneyIcon}
            color="#4caf50"
            secondaryText="From completed payments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Processing Orders"
            value={orders.filter(o => o.status === 'processing').length}
            icon={PendingIcon}
            color="#ff9800"
            secondaryText="Orders being processed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Reviews"
            value={reviews.length}
            icon={ReviewIcon}
            color="#9c27b0"
            secondaryText="All product reviews"
          />
        </Grid>
      </Grid>

      <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Analytics" />
        <Tab label="Reviews" />
      </Tabs>

      {tabIndex === 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin/create-product')}
            sx={{ mb: 2 }}
          >
            Add New Product
          </Button>
          <Paper>
            {loadingProducts ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ mt: 2 }}>
          <Paper>
            {loadingOrders ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Shipping</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
                      <TableCell>{order.user?.name || 'N/A'}</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={updatingOrder === order._id}
                            renderValue={(value) => (
                              <Chip 
                                label={value} 
                                size="small"
                                color={STATUS_COLORS[value]}
                              />
                            )}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <MenuItem key={status} value={status}>
                                <Chip 
                                  label={status} 
                                  size="small"
                                  color={STATUS_COLORS[status]}
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={order.paymentStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value, 'paymentStatus')}
                            disabled={updatingOrder === order._id}
                            renderValue={(value) => (
                              <Chip 
                                label={value} 
                                size="small"
                                color={STATUS_COLORS[value]}
                              />
                            )}
                          >
                            {PAYMENT_STATUSES.map((status) => (
                              <MenuItem key={status} value={status}>
                                <Chip 
                                  label={status} 
                                  size="small"
                                  color={STATUS_COLORS[status]}
                                />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {order.shippingAddress.city}, {order.shippingAddress.country}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteOrder(order._id)}
                          sx={{ ml: 1 }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Box>
      )}

      {tabIndex === 2 && <AnalyticsDashboard />}
      {tabIndex === 3 && <ReviewsTable />}
      <OrderDetailsDialog 
        open={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </Container>
  );
};

export default AdminDashboard;
