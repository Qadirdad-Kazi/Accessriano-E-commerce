import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const navigate = useNavigate();

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const res = await axios.get("http://localhost:5000/api/products", config);
      setProducts(res.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch orders from the API
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      const res = await axios.get("http://localhost:5000/api/orders", config);
      setOrders(res.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
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

  // Delete product function with toast notifications
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      await axios.delete(`http://localhost:5000/api/products/${id}`, config);
      toast.success("Product deleted successfully!");
      // Refresh the product list after deletion
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    }
  };

  // Delete order function with toast notifications
  const handleDeleteOrder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "x-auth-token": token } };
      await axios.delete(`http://localhost:5000/api/orders/${id}`, config);
      toast.success("Order deleted successfully!");
      // Refresh the orders list after deletion
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Products" />
        <Tab label="Orders" />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        {tabIndex === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Manage Products
            </Typography>
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
                          onClick={() =>
                            navigate(`/admin/edit-product/${product._id}`)
                          }
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
            <Typography variant="h6" gutterBottom>
              Manage Orders
            </Typography>
            {loadingOrders ? (
              <CircularProgress />
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>${order.totalAmount}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteOrder(order._id)}
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
      </Box>
    </Container>
  );
};

export default AdminDashboard;
