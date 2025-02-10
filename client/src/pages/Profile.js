import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Box, CircularProgress } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user's profile details when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };
        const res = await axios.get('http://localhost:5000/api/auth/profile', config);
        // Set initial form values based on fetched data
        setInitialValues({
          name: res.data.data.name,
          email: res.data.data.email,
          // Add any additional fields if available (e.g., phone, address)
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Define validation schema using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
  });

  // Handle form submission to update the profile
  const handleSubmit = async (values, actions) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.put('http://localhost:5000/api/auth/profile', values, config);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
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
        Your Profile
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
                label="Email"
                name="email"
                fullWidth
                margin="normal"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled
              />
            </Box>
            {/* You can add more fields here as needed */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              Update Profile
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default Profile;
