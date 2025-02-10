import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Box } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

// Replace with your actual Stripe public key
const stripePromise = loadStripe('pk_test_your_public_key_here');

// ----------------- Credit Card Payment Form -----------------
const CreditCardPaymentForm = ({ totalAmount, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Create a Payment Intent on the server
    axios
      .post('http://localhost:5000/api/payment/create-payment-intent', { amount: totalAmount })
      .then(response => {
        setClientSecret(response.data.clientSecret);
      })
      .catch(error => {
        console.error('Error creating payment intent:', error);
      });
  }, [totalAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });
    if (result.error) {
      setMessage(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        setMessage('Payment successful!');
        onPaymentSuccess();
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <CardElement />
      <Button type="submit" variant="contained" color="primary" disabled={!stripe} sx={{ mt: 2 }}>
        Pay ${totalAmount} with Credit Card
      </Button>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </Box>
  );
};

// ----------------- JazzCash Payment Form -----------------
const JazzCashPaymentForm = ({ totalAmount, onPaymentSuccess }) => {
  const handleJazzCashPayment = () => {
    // TODO: Integrate JazzCash API.
    // For demonstration, we'll simulate a successful JazzCash payment.
    alert('Simulated JazzCash payment successful!');
    onPaymentSuccess();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography>Proceed with JazzCash Payment</Typography>
      <Button variant="contained" color="secondary" onClick={handleJazzCashPayment} sx={{ mt: 2 }}>
        Pay ${totalAmount} with JazzCash
      </Button>
    </Box>
  );
};

// ----------------- Cash on Delivery (COD) Form -----------------
const CODPaymentForm = ({ totalAmount, onPaymentSuccess }) => {
  const handleCOD = () => {
    // For COD, simply flag the order as COD without online processing.
    alert('Order placed with Cash on Delivery!');
    onPaymentSuccess();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography>Proceed with Cash on Delivery</Typography>
      <Button variant="contained" color="success" onClick={handleCOD} sx={{ mt: 2 }}>
        Place Order (COD)
      </Button>
    </Box>
  );
};

// ----------------- Main Payment Component -----------------
const Payment = () => {
  // For demonstration, we'll assume a fixed total amount (e.g., $50)
  const totalAmount = 50;
  const [paymentMethod, setPaymentMethod] = useState('creditCard'); // Default method
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    // Here, you might redirect to an order confirmation page or update the order status.
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Payment</Typography>
      <FormControl component="fieldset">
        <FormLabel component="legend">Select Payment Method</FormLabel>
        <RadioGroup row value={paymentMethod} onChange={handlePaymentMethodChange}>
          <FormControlLabel value="creditCard" control={<Radio />} label="Credit Card" />
          <FormControlLabel value="jazzCash" control={<Radio />} label="JazzCash" />
          <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
        </RadioGroup>
      </FormControl>
      <Box sx={{ mt: 3 }}>
        {paymentMethod === 'creditCard' && (
          <Elements stripe={stripePromise}>
            <CreditCardPaymentForm totalAmount={totalAmount} onPaymentSuccess={handlePaymentSuccess} />
          </Elements>
        )}
        {paymentMethod === 'jazzCash' && (
          <JazzCashPaymentForm totalAmount={totalAmount} onPaymentSuccess={handlePaymentSuccess} />
        )}
        {paymentMethod === 'cod' && (
          <CODPaymentForm totalAmount={totalAmount} onPaymentSuccess={handlePaymentSuccess} />
        )}
      </Box>
      {paymentCompleted && (
        <Typography variant="h6" sx={{ mt: 2, color: 'green' }}>
          Payment Completed Successfully! (Proceed to Order Confirmation)
        </Typography>
      )}
    </Container>
  );
};

export default Payment;
