import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
  Drawer,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import SearchFilters from './SearchFilters'; // ✅ Import SearchFilters

const MotionIconButton = motion(IconButton);

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // ✅ State for filter drawer
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'primary.dark' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: 1
            }}
          >
            ACCESSRIANO
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={2} sx={{ ml: 4 }}>
              <Button color="inherit" startIcon={<HomeIcon />} component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" startIcon={<CategoryIcon />} component={Link} to="/categories">
                Categories
              </Button>
            </Stack>
          )}

          {/* Filter Button to Open Drawer */}
          <MotionIconButton color="inherit" onClick={() => setIsFilterOpen(true)}>
            <FilterIcon />
          </MotionIconButton>

          {/* Filter Drawer */}
          <Drawer anchor="right" open={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
            <Box sx={{ width: 300, p: 2 }}>
              <Typography variant="h6">Filters</Typography>
              <SearchFilters
                filters={{ price: { min: 0, max: 100 }, rating: 0, category: '', brands: [], tags: [] }}
                selectedFilters={{}}
                onFilterChange={() => {}}
                onClearFilters={() => {}}
                loading={false}
              />
            </Box>
          </Drawer>

          <Box sx={{ flexGrow: 1 }} />

          <LanguageSwitcher />

          <MotionIconButton color="inherit" component={Link} to="/cart">
            <Badge badgeContent={cartItemCount} color="secondary">
              <CartIcon />
            </Badge>
          </MotionIconButton>

          {user ? (
            <>
              <Tooltip title="Account settings">
                <IconButton onClick={handleMenu} size="small" color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem component={Link} to="/profile" onClick={handleClose}>Profile</MenuItem>
                <MenuItem component={Link} to="/order-history" onClick={handleClose}>Orders</MenuItem>
                {user.role === 'admin' && <MenuItem component={Link} to="/admin" onClick={handleClose}>Admin</MenuItem>}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" variant="outlined" component={Link} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
