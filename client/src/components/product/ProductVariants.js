import React from 'react';
import {
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Grid,
} from '@mui/material';
import { formatPrice } from '../../utils/formatters';

const ProductVariants = ({ variants, selectedVariant, onVariantChange }) => {
    const handleVariantChange = (event, newVariant) => {
        if (newVariant !== null) {
            onVariantChange(newVariant);
        }
    };

    // Group variants by their type (e.g., color, size, etc.)
    const variantGroups = variants.reduce((groups, variant) => {
        const { type } = variant;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(variant);
        return groups;
    }, {});

    return (
        <Box>
            {Object.entries(variantGroups).map(([type, groupVariants]) => (
                <Box key={type} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, textTransform: 'capitalize' }}>
                        {type}
                    </Typography>
                    <ToggleButtonGroup
                        value={selectedVariant}
                        exclusive
                        onChange={handleVariantChange}
                        aria-label={`Select ${type}`}
                    >
                        {groupVariants.map((variant) => {
                            const isSelected = selectedVariant?._id === variant._id;
                            const isOutOfStock = variant.stock === 0;

                            return (
                                <ToggleButton
                                    key={variant._id}
                                    value={variant}
                                    disabled={isOutOfStock}
                                    sx={{
                                        p: 1,
                                        minWidth: type === 'color' ? 48 : 'auto',
                                        borderRadius: '4px',
                                        m: 0.5,
                                        border: isSelected ? '2px solid' : '1px solid',
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        opacity: isOutOfStock ? 0.5 : 1,
                                    }}
                                >
                                    <Tooltip
                                        title={isOutOfStock ? 'Out of Stock' : formatPrice(variant.price)}
                                        arrow
                                    >
                                        <Grid
                                            container
                                            direction={type === 'color' ? 'column' : 'row'}
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            {type === 'color' && (
                                                <Grid item>
                                                    <Box
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            backgroundColor: variant.value,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                        }}
                                                    />
                                                </Grid>
                                            )}
                                            <Grid item>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: isSelected ? 'bold' : 'normal',
                                                    }}
                                                >
                                                    {type === 'color' ? '' : variant.value}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Tooltip>
                                </ToggleButton>
                            );
                        })}
                    </ToggleButtonGroup>
                </Box>
            ))}
        </Box>
    );
};

export default ProductVariants;
