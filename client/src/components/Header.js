import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  InputBase,
  IconButton,
  Paper,
  alpha
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Search as SearchIcon } from '@mui/icons-material';

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('token');
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded && decoded.user && decoded.user.role === 'admin') {
        isAdmin = true;
      }
    } catch (err) {
      console.error('Token decode error:', err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', gap: 2 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit', minWidth: 'max-content' }}
        >
          Accessriano
        </Typography>

        {/* Search Bar */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            px: 1,
            py: 0.5,
            mx: 2,
            backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.common.white, 0.25),
            },
          }}
        >
          <InputBase
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              color: 'inherit',
              '& .MuiInputBase-input': {
                color: 'inherit',
                '&::placeholder': {
                  color: 'inherit',
                  opacity: 0.7,
                },
              },
            }}
          />
          <IconButton type="submit" sx={{ color: 'inherit' }}>
            <SearchIcon />
          </IconButton>
        </Paper>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/cart">Cart</Button>
          <Button color="inherit" component={Link} to="/order-history">Orders</Button>
          {/* Show admin link if the user is admin */}
          {token && isAdmin && (
            <Button color="inherit" component={Link} to="/admin">Admin</Button>
          )}
          {token ? (
            <>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
