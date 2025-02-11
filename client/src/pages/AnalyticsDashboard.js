import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Attempt to fetch analytics data from your backend API
        const res = await axios.get('http://localhost:5000/api/analytics');
        setAnalyticsData(res.data.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to fetch analytics data.');
        // Use dummy data for demonstration
        setAnalyticsData({
          totalOrders: 120,
          totalReviews: 85,
          averageRating: 4.2,
          totalProducts: 45,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  // Prepare chart data
  const chartData = [
    { name: 'Orders', value: analyticsData.totalOrders },
    { name: 'Reviews', value: analyticsData.totalReviews },
    { name: 'Products', value: analyticsData.totalProducts },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Orders</Typography>
            <Typography variant="h4">{analyticsData.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Reviews</Typography>
            <Typography variant="h4">{analyticsData.totalReviews}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Average Rating</Typography>
            <Typography variant="h4">{analyticsData.averageRating}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Products</Typography>
            <Typography variant="h4">{analyticsData.totalProducts}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart Section */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Overview Chart
      </Typography>
      <Paper sx={{ p: 2 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Container>
  );
};

export default AnalyticsDashboard;
