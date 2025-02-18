import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email: formData.email });

      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Redirect based on user role
        if (response.data.user.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Redirecting to home page');
          navigate('/');
        }
      } else {
        setError('Invalid response from server: No token received');
        console.error('Invalid response:', response.data);
      }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      setError(
        err.response?.data?.message ||
        'Unable to connect to the server. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 2
      }}>
        <Typography variant="h4" component="h1">
          {t('auth.login')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
          <TextField
            label={t('auth.email')}
            name="email"
            type="email"
            required
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
          />
          <TextField
            label={t('auth.password')}
            name="password"
            type="password"
            required
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            autoComplete="current-password"
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('auth.login_button')
            )}
          </Button>
          <Typography variant="body2" align="center">
            <Link to="/request-password-reset" style={{ textDecoration: 'none' }}>
              {t('auth.forgot_password')}
            </Link>
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            {t('auth.no_account')}{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              {t('auth.register_now')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
