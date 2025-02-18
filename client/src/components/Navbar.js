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
  Popover,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  LocalShipping as ShippingIcon,
  Info as InfoIcon,
  ContactMail as ContactMailIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { MotionIconButton } from './MotionComponents';
import SearchBar from './SearchBar';
import api from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryClick = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryAnchorEl(null);
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
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <MenuItem 
        component={Link} 
        to="/categories"
        onClick={handleCategoryClose}
      >
        <ListItemIcon>
          <CategoryIcon />
        </ListItemIcon>
        <ListItemText>All Categories</ListItemText>
      </MenuItem>
      <Divider />
      {categories.map((category) => (
        <MenuItem
          key={category.name}
          component={Link}
          to={`/products?category=${encodeURIComponent(category.name)}`}
          onClick={handleCategoryClose}
        >
          <ListItemText>
            {category.name}
            {category.count && ` (${category.count})`}
          </ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
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
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  component={Link}
                  to={item.path}
                  color="inherit"
                >
                  {item.text}
                </Button>
              ))}
              <Button
                color="inherit"
                startIcon={<CategoryIcon />}
                endIcon={<ArrowDownIcon />}
                onClick={handleCategoryClick}
              >
                Categories
              </Button>
            </Stack>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchBar />
            
            {user ? (
              <>
                <Tooltip title="Cart">
                  <MotionIconButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    color="inherit"
                    component={Link}
                    to="/cart"
                  >
                    <Badge badgeContent={cart?.items?.length || 0} color="primary">
                      <CartIcon />
                    </Badge>
                  </MotionIconButton>
                </Tooltip>

                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleMenu}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: user.role === 'admin' ? 'secondary.main' : 'primary.main',
                        border: user.role === 'admin' ? '2px solid #FFD700' : 'none'
                      }}>
                        {user.role === 'admin' ? <AdminIcon /> : user.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Box>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  onClick={handleClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  {user.role === 'admin' && (
                    <Box sx={{ bgcolor: 'secondary.light', px: 2, py: 1 }}>
                      <Typography variant="subtitle2" color="secondary.contrastText">
                        Admin Account
                      </Typography>
                    </Box>
                  )}
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.text}
                      onClick={() => {
                        navigate(item.path);
                        handleClose();
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="inherit"
                startIcon={<PersonIcon />}
                component={Link}
                to="/login"
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                button
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <ListItem button onClick={handleCategoryClick}>
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {renderCategories()}
    </AppBar>
  );
};

export default Navbar;
