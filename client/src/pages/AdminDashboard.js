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
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnalyticsDashboard from './AnalyticsDashboard'; // Ensure this exists
import API_BASE_URL from '../config'; // ✅ Import API URL

const AdminDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch Products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const res = await axios.get(`${API_BASE_URL}/products`, config); // ✅ Dynamic API URL
      setProducts(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // ✅ Fetch Orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const res = await axios.get(`${API_BASE_URL}/orders`, config); // ✅ Dynamic API URL
      setOrders(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // ✅ Delete Product
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      await axios.delete(`${API_BASE_URL}/products/${id}`, config); // ✅ Dynamic API URL
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };

  // ✅ Delete Order
  const handleDeleteOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      await axios.delete(`${API_BASE_URL}/orders/${id}`, config); // ✅ Dynamic API URL
      toast.success("Order deleted successfully!");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to delete order.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Analytics" />
        <Tab label="Reviews" />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        {tabIndex === 0 && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Manage Products</Typography>
              <Button variant="contained" color="success" onClick={() => navigate('/admin/create-product')}>
                Create New Product
              </Button>
            </Box>
            {loadingProducts ? (
              <CircularProgress />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ mr: 1 }}
                          onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
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
        )}
        {tabIndex === 1 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Manage Orders</Typography>
            {loadingOrders ? (
              <CircularProgress />
            ) : (
              <Table>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>${order.totalAmount}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="error" onClick={() => handleDeleteOrder(order._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        )}
        {tabIndex === 2 && <AnalyticsDashboard />}
      </Box>
    </Container>
  );
};

export default AdminDashboard;
