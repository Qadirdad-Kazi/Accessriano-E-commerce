import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  // Initial form values
  const initialValues = {
    name: '',
    description: '',
    price: '',
  };

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be a positive number')
      .required('Price is required'),
  });

  // Handle file input change
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (values, actions) => {
    try {
      const token = localStorage.getItem('token');
      // Create a FormData object to hold form values and file
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price);
      if (selectedFile) {
        // Append file under the field name that your backend expects (e.g., 'qrImage')
        formData.append('qrImage', selectedFile);
      }
      
      await axios.post('http://localhost:5000/api/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      });
      toast.success('Product created successfully!');
      navigate('/admin'); // Redirect to the Admin Dashboard after creation
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product.');
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Product
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Upload Product Image (QR Image)</Typography>
              <input type="file" onChange={handleFileChange} />
            </Box>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting} 
              sx={{ mt: 2 }}
            >
              Create Product
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default CreateProduct;
