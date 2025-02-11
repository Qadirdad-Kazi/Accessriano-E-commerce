import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [selectedQRImage, setSelectedQRImage] = useState(null);
  const [selectedProductImage, setSelectedProductImage] = useState(null);

  const initialValues = {
    name: '',
    description: '',
    price: '',
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be a positive number')
      .required('Price is required'),
  });

  // File change handlers; ensure the file input's name attributes match your backend expectation.
  const handleQRImageChange = (e) => {
    setSelectedQRImage(e.target.files[0]);
  };

  const handleProductImageChange = (e) => {
    setSelectedProductImage(e.target.files[0]);
  };

  const handleSubmit = async (values, actions) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price);

      if (selectedQRImage) {
        formData.append('qrImage', selectedQRImage);
      }
      if (selectedProductImage) {
        formData.append('productImage', selectedProductImage);
      }

      // Debug: log all FormData entries (for testing)
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const res = await axios.post('http://localhost:5000/api/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      });

      console.log('Response from product creation:', res.data);
      toast.success('Product created successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating product:', error.response ? error.response.data : error);
      toast.error('Failed to create product.');
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Create New Product</Typography>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                margin="normal"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                margin="normal"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Price"
                name="price"
                type="number"
                fullWidth
                margin="normal"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.price && Boolean(errors.price)}
                helperText={touched.price && errors.price}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Upload QR Image</Typography>
              <input type="file" name="qrImage" onChange={handleQRImageChange} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Upload Product Image</Typography>
              <input type="file" name="productImage" onChange={handleProductImageChange} />
            </Box>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ mt: 2 }}>
              Create Product
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default CreateProduct;
