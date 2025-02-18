import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Slider, 
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Button,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';

const SearchFilters = ({
    filters = { price: { min: 0, max: 100 }, rating: 0, category: '', brands: [], tags: [] }, 
    selectedFilters = {}, 
    onFilterChange, 
    onClearFilters, 
    loading 
}) => {
    const handlePriceChange = (event, newValue) => {
        onFilterChange('price', {
            min: newValue[0],
            max: newValue[1]
        });
    };

    const handleRatingChange = (event) => {
        onFilterChange('rating', event.target.value);
    };

    const handleCategoryChange = (event) => {
        onFilterChange('category', event.target.value);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Filters
                </Typography>
                <Button size="small" onClick={onClearFilters} disabled={loading}>
                    Clear All
                </Button>
            </Box>

            {/* Price Range */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Price Range</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Slider
                        value={[
                            selectedFilters.price?.min ?? filters.price.min,
                            selectedFilters.price?.max ?? filters.price.max
                        ]}
                        onChange={handlePriceChange}
                        valueLabelDisplay="auto"
                        min={filters.price.min}
                        max={filters.price.max}
                        disabled={loading}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2">${selectedFilters.price?.min ?? filters.price.min}</Typography>
                        <Typography variant="body2">${selectedFilters.price?.max ?? filters.price.max}</Typography>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Category */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Category</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup value={selectedFilters.category || ''} onChange={handleCategoryChange}>
                        {(filters.categories || []).map((category) => (
                            <FormControlLabel
                                key={category}
                                value={category}
                                control={<Radio size="small" />}
                                label={category}
                                disabled={loading}
                            />
                        ))}
                    </RadioGroup>
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
};

export default SearchFilters;
