import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from '../components/ProtectedRoute';

// Import your pages
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderConfirmation from '../pages/OrderConfirmation';
import OrderHistory from '../pages/OrderHistory';
import AdminDashboard from '../pages/AdminDashboard';
import CreateProduct from '../pages/CreateProduct';
import EditProduct from '../pages/EditProduct';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import AdminOrders from '../pages/AdminOrders';
import Profile from '../pages/Profile';
import RequestPasswordReset from '../pages/RequestPasswordReset';
import PasswordReset from '../pages/PasswordReset';

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/password-reset/:token" element={<PasswordReset />} />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-confirmation" 
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-history" 
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create-product" 
          element={
            <ProtectedRoute requiredRole="admin">
              <CreateProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit-product/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <EditProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AnalyticsDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
