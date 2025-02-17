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
    filters,
    selectedFilters,
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

    const handleBrandChange = (category) => {
        onFilterChange('brand', category);
    };

    const handleTagChange = (tag) => {
        const currentTags = selectedFilters.tags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        onFilterChange('tags', newTags);
    };

    const handleStockChange = (event) => {
        onFilterChange('inStock', event.target.checked);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Filters
                </Typography>
                <Button
                    size="small"
                    onClick={onClearFilters}
                    disabled={loading}
                >
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
                        value={[selectedFilters.price?.min || filters.priceRange.min, selectedFilters.price?.max || filters.priceRange.max]}
                        onChange={handlePriceChange}
                        valueLabelDisplay="auto"
                        min={filters.priceRange.min}
                        max={filters.priceRange.max}
                        disabled={loading}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2">
                            ${selectedFilters.price?.min || filters.priceRange.min}
                        </Typography>
                        <Typography variant="body2">
                            ${selectedFilters.price?.max || filters.priceRange.max}
                        </Typography>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Categories */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Category</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup
                        value={selectedFilters.category || ''}
                        onChange={handleCategoryChange}
                    >
                        {filters.categories.map((category) => (
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

            {/* Brands */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Brands</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup
                        value={selectedFilters.brand || ''}
                        onChange={(e) => handleBrandChange(e.target.value)}
                    >
                        {filters.brands.map((brand) => (
                            <FormControlLabel
                                key={brand}
                                value={brand}
                                control={<Radio size="small" />}
                                label={brand}
                                disabled={loading}
                            />
                        ))}
                    </RadioGroup>
                </AccordionDetails>
            </Accordion>

            {/* Rating */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Minimum Rating</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <RadioGroup
                        value={selectedFilters.rating || ''}
                        onChange={handleRatingChange}
                    >
                        {[4, 3, 2, 1].map((rating) => (
                            <FormControlLabel
                                key={rating}
                                value={rating}
                                control={<Radio size="small" />}
                                label={`${rating}+ Stars`}
                                disabled={loading}
                            />
                        ))}
                    </RadioGroup>
                </AccordionDetails>
            </Accordion>

            {/* Tags */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Tags</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {filters.tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                onClick={() => handleTagChange(tag)}
                                color={selectedFilters.tags?.includes(tag) ? 'primary' : 'default'}
                                variant={selectedFilters.tags?.includes(tag) ? 'filled' : 'outlined'}
                                disabled={loading}
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Stock Status */}
            <Box sx={{ mt: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectedFilters.inStock || false}
                            onChange={handleStockChange}
                            disabled={loading}
                        />
                    }
                    label="In Stock Only"
                />
            </Box>
        </Paper>
    );
};

export default SearchFilters;
