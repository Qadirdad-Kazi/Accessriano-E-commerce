import React, { useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Grid,
    IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CATEGORIES = [
    'Electronics',
    'Cameras',
    'Laptops',
    'Accessories',
    'Headphones',
    'Sports',
    'Books',
    'Clothes/Shoes',
    'Beauty/Health',
    'Outdoor',
    'Home'
];

const CreateProduct = () => {
    const navigate = useNavigate();
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [qrCodePreview, setQrCodePreview] = useState('');

    const initialValues = {
        name: '',
        sku: '',
        description: '',
        price: '',
        discountPrice: '',
        discountPercentage: '',
        onSale: false,
        brand: '',
        category: '',
        seller: '',
        stock: '',
        specifications: [],
        variants: [],
        dimensions: {
            length: '',
            width: '',
            height: '',
            unit: 'cm'
        },
        weight: {
            value: '',
            unit: 'g'
        }
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Name is required')
            .max(100, 'Name cannot exceed 100 characters'),
        sku: Yup.string()
            .required('SKU is required')
            .min(3, 'SKU must be at least 3 characters'),
        description: Yup.string()
            .required('Description is required')
            .max(2000, 'Description cannot exceed 2000 characters'),
        price: Yup.number()
            .typeError('Price must be a number')
            .positive('Price must be a positive number')
            .required('Price is required'),
        discountPrice: Yup.number()
            .typeError('Discount price must be a number')
            .min(0, 'Discount price cannot be negative')
            .test('less-than-price', 'Discount price must be less than regular price', 
                function(value) {
                    return !value || value < this.parent.price;
                }),
        discountPercentage: Yup.number()
            .typeError('Discount percentage must be a number')
            .min(0, 'Discount percentage cannot be negative')
            .max(100, 'Discount percentage cannot exceed 100'),
        brand: Yup.string()
            .required('Brand is required'),
        category: Yup.string()
            .required('Category is required')
            .oneOf(CATEGORIES, 'Please select a valid category'),
        seller: Yup.string()
            .required('Seller is required'),
        stock: Yup.number()
            .typeError('Stock must be a number')
            .min(0, 'Stock cannot be negative')
            .required('Stock is required'),
        specifications: Yup.array().of(
            Yup.object().shape({
                name: Yup.string().required('Specification name is required'),
                value: Yup.string().required('Specification value is required')
            })
        ),
        variants: Yup.array().of(
            Yup.object().shape({
                color: Yup.string(),
                size: Yup.string(),
                stock: Yup.number().min(0),
                price: Yup.number().min(0)
            })
        ),
        dimensions: Yup.object().shape({
            length: Yup.number().min(0),
            width: Yup.number().min(0),
            height: Yup.number().min(0),
            unit: Yup.string().oneOf(['cm', 'in'])
        }),
        weight: Yup.object().shape({
            value: Yup.number().min(0),
            unit: Yup.string().oneOf(['kg', 'g', 'lb', 'oz'])
        })
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        // Validate file size
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            toast.error('Some files are too large! Maximum size is 2MB per image');
            return;
        }

        // Validate total number of files
        if (selectedImages.length + files.length > 5) {
            toast.error('Maximum 5 product images allowed');
            return;
        }
        
        files.forEach(file => {
            const reader = new FileReader();
            
            reader.onload = () => {
                setImagePreview(oldArray => [...oldArray, reader.result]);
            }
            
            reader.readAsDataURL(file);
        });
        
        setSelectedImages(oldArray => [...oldArray, ...files]);
    };

    const removeImage = (index) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
        setImagePreview(imagePreview.filter((_, i) => i !== index));
    };

    const handleQrCodeChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (file) {
            // Validate file size
            if (file.size > maxSize) {
                toast.error('QR code image is too large! Maximum size is 2MB');
                return;
            }

            setQrCodeImage(file);
            const reader = new FileReader();
            reader.onload = () => {
                setQrCodePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values, actions) => {
        try {
            if (selectedImages.length === 0) {
                toast.error('Please upload at least one product image');
                return;
            }

            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            // Handle arrays and objects properly
            Object.keys(values).forEach(key => {
                if (key === 'specifications' || key === 'variants') {
                    // Send empty arrays if no items
                    formData.append(key, JSON.stringify(values[key] || []));
                } else if (key === 'dimensions' || key === 'weight') {
                    // Send objects as JSON strings
                    formData.append(key, JSON.stringify(values[key] || {}));
                } else {
                    formData.append(key, values[key]);
                }
            });
            
            // Append product images
            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            // Append QR code image if exists
            if (qrCodeImage) {
                formData.append('qrCode', qrCodeImage);
            }

            const res = await axios.post('http://localhost:5000/api/products/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            toast.success('Product created successfully!');
            navigate('/admin');
        } catch (error) {
            console.error('Error creating product:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || 'Failed to create product';
            toast.error(errorMessage);
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
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
                    setFieldValue,
                }) => (
                    <Form>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    name="name"
                                    fullWidth
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="SKU"
                                    name="sku"
                                    fullWidth
                                    value={values.sku}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.sku && Boolean(errors.sku)}
                                    helperText={touched.sku && errors.sku}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    name="description"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={values.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Price"
                                    name="price"
                                    type="number"
                                    fullWidth
                                    value={values.price}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.price && Boolean(errors.price)}
                                    helperText={touched.price && errors.price}
                                    InputProps={{
                                        startAdornment: '$',
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Discount Price"
                                    name="discountPrice"
                                    type="number"
                                    fullWidth
                                    value={values.discountPrice}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.discountPrice && Boolean(errors.discountPrice)}
                                    helperText={touched.discountPrice && errors.discountPrice}
                                    InputProps={{
                                        startAdornment: '$',
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Discount Percentage"
                                    name="discountPercentage"
                                    type="number"
                                    fullWidth
                                    value={values.discountPercentage}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.discountPercentage && Boolean(errors.discountPercentage)}
                                    helperText={touched.discountPercentage && errors.discountPercentage}
                                    InputProps={{
                                        endAdornment: '%',
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Stock"
                                    name="stock"
                                    type="number"
                                    fullWidth
                                    value={values.stock}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.stock && Boolean(errors.stock)}
                                    helperText={touched.stock && errors.stock}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    error={touched.category && Boolean(errors.category)}
                                >
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={values.category}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        label="Category"
                                    >
                                        {CATEGORIES.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {touched.category && errors.category && (
                                        <FormHelperText>{errors.category}</FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Brand"
                                    name="brand"
                                    fullWidth
                                    value={values.brand}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.brand && Boolean(errors.brand)}
                                    helperText={touched.brand && errors.brand}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Seller"
                                    name="seller"
                                    fullWidth
                                    value={values.seller}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.seller && Boolean(errors.seller)}
                                    helperText={touched.seller && errors.seller}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Dimensions
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Length"
                                            name="dimensions.length"
                                            type="number"
                                            fullWidth
                                            value={values.dimensions.length}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Width"
                                            name="dimensions.width"
                                            type="number"
                                            fullWidth
                                            value={values.dimensions.width}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            label="Height"
                                            name="dimensions.height"
                                            type="number"
                                            fullWidth
                                            value={values.dimensions.height}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Unit</InputLabel>
                                            <Select
                                                name="dimensions.unit"
                                                value={values.dimensions.unit}
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="cm">cm</MenuItem>
                                                <MenuItem value="in">in</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Weight
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Weight"
                                            name="weight.value"
                                            type="number"
                                            fullWidth
                                            value={values.weight.value}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Unit</InputLabel>
                                            <Select
                                                name="weight.unit"
                                                value={values.weight.unit}
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="g">g</MenuItem>
                                                <MenuItem value="kg">kg</MenuItem>
                                                <MenuItem value="lb">lb</MenuItem>
                                                <MenuItem value="oz">oz</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Product Images
                                </Typography>
                                <input
                                    accept="image/*"
                                    type="file"
                                    multiple
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    id="product-images"
                                />
                                <label htmlFor="product-images">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        fullWidth
                                    >
                                        Upload Images
                                    </Button>
                                </label>
                                
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    {imagePreview.map((image, index) => (
                                        <Grid item xs={4} sm={3} key={index}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    paddingTop: '100%',
                                                    '& img': {
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    },
                                                }}
                                            >
                                                <img src={image} alt={`Preview ${index + 1}`} />
                                                <IconButton
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        bgcolor: 'background.paper',
                                                    }}
                                                    size="small"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    AR View QR Code
                                </Typography>
                                <input
                                    accept="image/*"
                                    type="file"
                                    onChange={handleQrCodeChange}
                                    style={{ display: 'none' }}
                                    id="qr-code-image"
                                />
                                <label htmlFor="qr-code-image">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        fullWidth
                                    >
                                        Upload QR Code
                                    </Button>
                                </label>
                                
                                {qrCodePreview && (
                                    <Box sx={{ mt: 2 }}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: '150px',
                                                height: '150px',
                                                '& img': {
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                },
                                            }}
                                        >
                                            <img src={qrCodePreview} alt="QR Code Preview" />
                                            <IconButton
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    bgcolor: 'background.paper',
                                                }}
                                                onClick={() => {
                                                    setQrCodeImage(null);
                                                    setQrCodePreview('');
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                    fullWidth
                                    size="large"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Product'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik>
        </Container>
    );
};

export default CreateProduct;
