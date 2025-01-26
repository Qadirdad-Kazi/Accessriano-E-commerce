import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./Checkout.css";

const Checkout = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    paymentMethod: "JazzCash",
  });
  const [cartItems] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = () => {
    // Send order data to backend or show a success message
    console.log("Order placed:", formData, cartItems);
    localStorage.removeItem("cart");
    navigate("/checkout/success");
  };

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mt-5">
      <h1 className="text-center">Checkout</h1>
      <div className="checkout-form">
        <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
        <div className="mb-3">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label>Address</label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
        <div className="mb-3">
          <label>Payment Method</label>
          <select
            className="form-select"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
          >
            <option value="JazzCash">JazzCash</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </div>
        <button className="btn btn-success" onClick={handlePlaceOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;
