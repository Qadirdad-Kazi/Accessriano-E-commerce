import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Favorite as FavoriteIcon,
  LocalShipping as ShippingIcon,
  Info as InfoIcon,
  ContactMail as ContactMailIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MotionIconButton } from './MotionComponents';
import SearchBar from './SearchBar';
import api from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data.success) {
          setCategories(response.data?.data || []); // ✅ Fixed: Ensure data is correctly set
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleCategoryClick = (event) => setCategoryAnchorEl(event.currentTarget);
  const handleCategoryClose = () => setCategoryAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
    { text: 'Contact', icon: <ContactMailIcon />, path: '/contact' },
  ];

  const userMenuItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Orders', icon: <ShippingIcon />, path: '/orders' },
    { text: 'Wishlist', icon: <FavoriteIcon />, path: '/wishlist' },
  ];

  if (user?.role === 'admin') {
    userMenuItems.unshift(
      { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/AdminDashboard' },
      { text: 'Manage Products', icon: <CategoryIcon />, path: '/admin/products' },
      { text: 'Manage Orders', icon: <ShippingIcon />, path: '/admin/orders' }
    );
  }

  const renderCategories = () => (
    <Menu
      anchorEl={categoryAnchorEl}
      open={Boolean(categoryAnchorEl)}
      onClose={handleCategoryClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <MenuItem component={Link} to="/categories" onClick={handleCategoryClose}>
        <ListItemIcon><CategoryIcon /></ListItemIcon>
        <ListItemText>All Categories</ListItemText>
      </MenuItem>
      <Divider />
      {categories.map((category) => (
        <MenuItem
          key={category._id || category.name} // ✅ Fixed: Ensures unique key
          component={Link}
          to={`/products?category=${encodeURIComponent(category.name)}`} // ✅ Fixed: Proper navigation
          onClick={handleCategoryClose}
        >
          <ListItemText>{category.name}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setMobileMenuOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: isMobile ? 0 : 1,
            }}
          >
            ACCESSRIANO
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button key={item.text} startIcon={item.icon} component={Link} to={item.path} color="inherit">
                  {item.text}
                </Button>
              ))}
              <Button color="inherit" startIcon={<CategoryIcon />} endIcon={<ArrowDownIcon />} onClick={handleCategoryClick}>
                Categories
              </Button>
            </Stack>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchBar />
            <Tooltip title="Cart">
              <MotionIconButton component={Link} to="/cart" color="inherit">
                <Badge badgeContent={cart?.items?.length || 0} color="primary">
                  <CartIcon />
                </Badge>
              </MotionIconButton>
            </Tooltip>

            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleMenu} size="small">
                    <Avatar sx={{ bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main' }}>
                      {user.role === 'admin' ? <AdminIcon /> : user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  {userMenuItems.map((item) => (
                    <MenuItem key={item.text} onClick={() => navigate(item.path)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" startIcon={<PersonIcon />} component={Link} to="/login">
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
      {renderCategories()}
    </AppBar>
  );
};

export default Navbar;
