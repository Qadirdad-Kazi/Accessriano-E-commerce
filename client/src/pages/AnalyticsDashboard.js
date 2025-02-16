import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import API_BASE_URL from '../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("No token found. Please log in as admin.");
        setLoading(false);
        return;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      console.log('Fetching analytics with token:', token.substring(0, 20) + '...');
      const res = await axios.get(`${API_BASE_URL}/analytics`, config);
      
      console.log('Analytics response:', res.data);
      
      if (res.data.success) {
        setAnalyticsData(res.data.data);
      } else {
        throw new Error(res.data.message || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Set up real-time updates
    const interval = setInterval(fetchAnalytics, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!analyticsData) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          No analytics data available
        </Typography>
      </Container>
    );
  }

  const { orders, products, users, revenue, topProducts, revenueData } = analyticsData;

  // Prepare data for product status pie chart
  const productStatusData = [
    { name: 'In Stock', value: products.inStock },
    { name: 'Out of Stock', value: products.outOfStock }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      
      {/* Orders and Revenue Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4" component="div">
              {orders.total}
            </Typography>
            <Typography color="textSecondary" sx={{ flex: 1 }}>
              Last 24h: {orders.recent}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" component="div">
              ${revenue.total.toFixed(2)}
            </Typography>
            <Typography color="textSecondary" sx={{ flex: 1 }}>
              Avg. Order: ${revenue.average.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Products
            </Typography>
            <Typography variant="h4" component="div">
              {products.total}
            </Typography>
            <Typography color="textSecondary" sx={{ flex: 1 }}>
              Out of Stock: {products.outOfStock}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography color="textSecondary" gutterBottom>
              Users
            </Typography>
            <Typography variant="h4" component="div">
              {users.total}
            </Typography>
            <Typography color="textSecondary" sx={{ flex: 1 }}>
              Customers: {users.customers}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Product Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Product Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productStatusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsDashboard;
