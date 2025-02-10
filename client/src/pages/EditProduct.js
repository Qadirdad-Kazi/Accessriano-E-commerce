import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product details for editing
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        // Set initial values for the form
        setInitialValues({
          name: res.data.data.name,
          description: res.data.data.description,
          price: res.data.data.price,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Validation schema for the form
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be a positive number')
      .required('Price is required'),
  });

  // Handle form submission to update the product
  const handleSubmit = async (values, actions) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.put(`http://localhost:5000/api/products/${id}`, values, config);
      toast.success('Product updated successfully!');
      navigate('/admin'); // Redirect back to the Admin Dashboard
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product.');
    } finally {
      actions.setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Product
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
        }) => (
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
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ mt: 2 }}>
              Update Product
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default EditProduct;
