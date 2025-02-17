import React from 'react';
import {
    Box,
    IconButton,
    Typography,
    TextField,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
} from '@mui/icons-material';

const QuantitySelector = ({ quantity, onChange, max = 99, min = 1 }) => {
    const handleIncrease = () => {
        if (quantity < max) {
            onChange(quantity + 1);
        }
    };

    const handleDecrease = () => {
        if (quantity > min) {
            onChange(quantity - 1);
        }
    };

    const handleInputChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value >= min && value <= max) {
            onChange(value);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ mr: 2 }}>
                Quantity:
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                }}
            >
                <IconButton
                    size="small"
                    onClick={handleDecrease}
                    disabled={quantity <= min}
                >
                    <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                    value={quantity}
                    onChange={handleInputChange}
                    type="number"
                    inputProps={{
                        min,
                        max,
                        style: {
                            width: '40px',
                            textAlign: 'center',
                            padding: '4px',
                            '-moz-appearance': 'textfield',
                        },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                            '-webkit-appearance': 'none',
                            margin: 0,
                        },
                    }}
                />
                <IconButton
                    size="small"
                    onClick={handleIncrease}
                    disabled={quantity >= max}
                >
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>
            {max < 99 && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    (Max: {max})
                </Typography>
            )}
        </Box>
    );
};

export default QuantitySelector;
