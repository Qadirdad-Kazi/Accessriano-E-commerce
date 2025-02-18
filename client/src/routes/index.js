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
import About from '../pages/About';
import Contact from '../pages/Contact';
import Orders from '../pages/Orders';
import Wishlist from '../pages/Wishlist';

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/password-reset/:token" element={<PasswordReset />} />

        {/* Protected Routes */}
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <Wishlist />
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
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create-product" 
          element={
            <ProtectedRoute adminOnly>
              <CreateProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit-product/:id" 
          element={
            <ProtectedRoute adminOnly>
              <EditProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute adminOnly>
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

        {/* 404 Route - Keep this last */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
