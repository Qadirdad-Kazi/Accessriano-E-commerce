import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar"; // Corrected
import Footer from "./components/Footer";
import AdminNavBar from "./components/Admin/AdminNavBar";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageProducts from "./components/Admin/ManageProducts";
import ManageOrders from "./components/Admin/ManageOrders";
import ManageUsers from "./components/Admin/ManageUsers";
import ManageReviews from "./components/Admin/ManageReviews";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<PaymentSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminNavBar />
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminNavBar />
              <ManageProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminNavBar />
              <ManageOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminNavBar />
              <ManageUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminRoute>
              <AdminNavBar />
              <ManageReviews />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
