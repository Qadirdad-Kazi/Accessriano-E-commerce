import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import AdminNavBar from "./components/Admin/AdminNavBar";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageProducts from "./components/Admin/ManageProducts";
import ManageOrders from "./components/Admin/ManageOrders";
import ManageUsers from "./components/Admin/ManageUsers";
import ManageReviews from "./components/Admin/ManageReviews";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
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
      </Router>
    </AuthProvider>
  );
}

export default App;
