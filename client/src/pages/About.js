import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  ThumbUp as QualityIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const About = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <ShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Delivery',
      description: 'We ensure quick and reliable delivery across Pakistan.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Payments',
      description: 'Your transactions are protected with advanced security.',
    },
    {
      icon: <QualityIcon sx={{ fontSize: 40 }} />,
      title: 'Quality Products',
      description: 'We offer only the highest quality accessories.',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: 'Our customer service team is always here to help.',
    },
  ];

  const teamMembers = [
    {
      name: 'Qadir Dad Kazi',
      role: 'Founder & CEO',
      image: '/path/to/team1.jpg', // Add actual image paths
      description: 'Passionate about bringing quality accessories to our customers.',
    },
    // Add more team members as needed
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ textAlign: 'center', mb: 8 }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          About Accessriano
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Your Premier Destination for Quality Accessories
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto' }}>
          At Accessriano, we believe that the right accessories can transform your style and boost your confidence.
          Founded in 2024, we've been dedicated to bringing you the finest selection of accessories at competitive prices.
        </Typography>
      </MotionBox>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionBox
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Mission Section */}
      <Paper sx={{ p: 4, mb: 8, bgcolor: 'background.default' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              We strive to provide our customers with the highest quality accessories that enhance their
              personal style and daily life. Our commitment to excellence drives us to carefully curate
              our collection, ensuring each piece meets our stringent standards.
            </Typography>
            <Typography variant="body1">
              We believe in sustainable practices and ethical business operations, working closely with
              trusted suppliers who share our values.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="/path/to/mission-image.jpg" // Add actual image path
              alt="Our Mission"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Team Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
          Meet Our Team
        </Typography>
        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MotionBox
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: 2,
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default About;
