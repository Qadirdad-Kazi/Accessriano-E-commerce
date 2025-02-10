import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import Profile from './pages/Profile';
import AnalyticsDashboard from './pages/AnalyticsDashboard'; // Import AnalyticsDashboard
import ChatbotWidget from './components/ChatbotWidget';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create-product" element={<CreateProduct />} />
          <Route path="/admin/edit-product/:id" element={<EditProduct />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        </Routes>
        <ChatbotWidget />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </CartProvider>
  );
}

export default App;
