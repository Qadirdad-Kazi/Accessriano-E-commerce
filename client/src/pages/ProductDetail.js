import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Card, CardContent, CardMedia, Button, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress 
} from '@mui/material';
import ProductReviews from '../components/ProductReviews';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [arOpen, setArOpen] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(response => {
        setProduct(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
        setLoading(false);
      });
  }, [id]);

  const handleArOpen = () => {
    setArOpen(true);
  };

  const handleArClose = () => {
    setArOpen(false);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">Product not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card>
        {product.qrImageUrl && (
          <CardMedia
            component="img"
            height="300"
            image={product.qrImageUrl}
            alt={product.name}
          />
        )}
        <CardContent>
          <Typography variant="h4" gutterBottom>{product.name}</Typography>
          <Typography variant="body1" paragraph>{product.description}</Typography>
          <Typography variant="h5" color="primary">Price: ${product.price}</Typography>
          {product.qrImageUrl && (
            <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handleArOpen}>
              View in AR
            </Button>
          )}
        </CardContent>
      </Card>

      {/* AR Visualization Dialog */}
      <Dialog open={arOpen} onClose={handleArClose}>
        <DialogTitle>AR Visualization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Scan this QR code with your mobile device to view the AR experience.
          </DialogContentText>
          {product.qrImageUrl && (
            <img 
              src={product.qrImageUrl} 
              alt="AR QR Code" 
              style={{ width: '100%', marginTop: '16px' }} 
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleArClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render the Product Reviews Component */}
      <ProductReviews />
    </Container>
  );
};

export default ProductDetail;
