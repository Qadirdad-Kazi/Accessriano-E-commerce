import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Card, CardContent, CardMedia, Button, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  CircularProgress, Grid 
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

  // Use fallback images if needed.
  const productImage = product.productImageUrl || "https://via.placeholder.com/600x400?text=No+Product+Image";
  const qrImage = product.qrImageUrl || "https://via.placeholder.com/150?text=No+QR+Image";

  return (
    <Container sx={{ mt: 4 }}>
      {/* Top: Display the product image */}
      <CardMedia
        component="img"
        height="400"
        image={productImage}
        alt={product.name}
        sx={{ mb: 2 }}
      />

      {/* Details Card with two columns: Left for details, right for QR image */}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {/* Left side: Product details */}
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                ${product.price}
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              {product.qrImageUrl && (
                <Button variant="contained" color="secondary" onClick={handleArOpen}>
                  View in AR
                </Button>
              )}
            </Grid>
            {/* Right side: QR image */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {product.qrImageUrl && (
                <img 
                  src={qrImage} 
                  alt="QR Code" 
                  style={{ width: '100%', maxWidth: '200px' }} 
                />
              )}
            </Grid>
          </Grid>
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
              src={qrImage} 
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

      {/* Product Reviews Component */}
      <ProductReviews />
    </Container>
  );
};

export default ProductDetail;
