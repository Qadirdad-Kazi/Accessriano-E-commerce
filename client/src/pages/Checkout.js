import React, { useState } from "react";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [payload, setPayload] = useState(null);

  const handlePayment = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/payments/initiate", {
        amount,
        email,
      });

      setRedirectUrl(response.data.redirectUrl);
      setPayload(response.data.payload);
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Checkout</h1>
      <div className="checkout-form">
        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Amount (PKR)</label>
          <input
            type="number"
            className="form-control"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handlePayment}>
          Proceed to Payment
        </button>
        {redirectUrl && (
          <form action={redirectUrl} method="POST" target="_blank">
            {Object.entries(payload).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
            <button type="submit" className="btn btn-success mt-3">
              Pay with JazzCash
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Checkout;
