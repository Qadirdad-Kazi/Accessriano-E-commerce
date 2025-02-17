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
  InputBase,
  Stack
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const MotionIconButton = motion(IconButton);

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: 1
            }}
          >
            ACCESSRIANO
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={2} sx={{ ml: 4 }}>
              <Button
                color="primary"
                startIcon={<HomeIcon />}
                component={Link}
                to="/"
              >
                Home
              </Button>
              <Button
                color="primary"
                startIcon={<CategoryIcon />}
                component={Link}
                to="/categories"
              >
                Categories
              </Button>
            </Stack>
          )}

          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
            />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MotionIconButton
              color="primary"
              component={Link}
              to="/cart"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Badge badgeContent={cartItemCount} color="secondary">
                <CartIcon />
              </Badge>
            </MotionIconButton>

            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleMenu}
                    size="small"
                    color="primary"
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/order-history" onClick={handleClose}>
                    Orders
                  </MenuItem>
                  {user.role === 'admin' && (
                    <>
                      <MenuItem component={Link} to="/admin" onClick={handleClose}>
                        Admin Dashboard
                      </MenuItem>
                      <MenuItem component={Link} to="/admin/orders" onClick={handleClose}>
                        Manage Orders
                      </MenuItem>
                      <MenuItem component={Link} to="/admin/create-product" onClick={handleClose}>
                        Add Product
                      </MenuItem>
                      <MenuItem component={Link} to="/admin/analytics" onClick={handleClose}>
                        Analytics
                      </MenuItem>
                    </>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="primary"
                variant="contained"
                component={Link}
                to="/login"
                sx={{ ml: 2 }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
