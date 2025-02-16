import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

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

          {/* Order Timeline */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Order Timeline</Typography>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(order.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last Updated: {new Date(order.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login as admin');
        return;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:5000/api/orders', config);
      
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        throw new Error(response.data.message);
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
    // Poll for updates every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusChange = async (orderId, newStatus, type = 'status') => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('token');
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const update = type === 'status' 
        ? { status: newStatus }
        : { paymentStatus: newStatus };

      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}`,
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Manage Orders</Typography>
        <Tooltip title="Refresh Orders">
          <IconButton onClick={fetchOrders} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  {order.user?.name || 'N/A'}
                  <br />
                  <Typography variant="caption" color="textSecondary">
                    {order.user?.email || 'N/A'}
                  </Typography>
                </TableCell>
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
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <OrderDetailsDialog 
        open={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </Container>
  );
};

export default AdminOrders;
