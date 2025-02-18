import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Chip,
  Divider,
  Button,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

const SearchFilters = ({ filters, onFilterChange, onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [inStock, setInStock] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    
    if (params.minPrice && params.maxPrice) {
      setPriceRange([Number(params.minPrice), Number(params.maxPrice)]);
    }
    
    if (params.categories) {
      setSelectedCategories(params.categories.split(','));
    }
    
    if (params.brands) {
      setSelectedBrands(params.brands.split(','));
    }
    
    if (params.tags) {
      setSelectedTags(params.tags.split(','));
    }
    
    if (params.minRating) {
      setMinRating(Number(params.minRating));
    }
    
    if (params.sortBy) {
      setSortBy(params.sortBy);
    }
    
    if (params.inStock) {
      setInStock(params.inStock === 'true');
    }
  }, [searchParams]);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceChangeCommitted = () => {
    updateFilters({
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    });
  };

  const handleCategoryChange = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    updateFilters({ categories: updated.join(',') });
  };

  const handleBrandChange = (brand) => {
    const updated = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(updated);
    updateFilters({ brands: updated.join(',') });
  };

  const handleTagChange = (tag) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updated);
    updateFilters({ tags: updated.join(',') });
  };

  const handleRatingChange = (event, value) => {
    setMinRating(value);
    updateFilters({ minRating: value });
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    updateFilters({ sortBy: event.target.value });
  };

  const handleStockChange = (event) => {
    setInStock(event.target.checked);
    updateFilters({ inStock: event.target.checked });
  };

  const updateFilters = (newFilters) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...currentParams,
      ...newFilters
    });
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedTags([]);
    setMinRating(0);
    setSortBy('newest');
    setInStock(false);
    setSearchParams({
      q: searchParams.get('q') || ''
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon /> Filters
        </Typography>
        <Button size="small" onClick={clearFilters}>
          Clear All
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Sort By</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl component="fieldset">
                <RadioGroup value={sortBy} onChange={handleSortChange}>
                  {sortOptions.map(option => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Price Range</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  onChangeCommitted={handlePriceChangeCommitted}
                  valueLabelDisplay="auto"
                  min={0}
                  max={1000}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 1000, label: '$1000' }
                  ]}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Categories</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters?.categories?.map(category => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => handleCategoryChange(category)}
                    color={selectedCategories.includes(category) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Brands</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters?.brands?.map(brand => (
                  <Chip
                    key={brand}
                    label={brand}
                    onClick={() => handleBrandChange(brand)}
                    color={selectedBrands.includes(brand) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Rating</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 2 }}>
                <Rating
                  name="minimum-rating"
                  value={minRating}
                  onChange={handleRatingChange}
                  precision={0.5}
                />
                <Typography variant="body2" color="text.secondary">
                  {minRating > 0 ? `${minRating} stars & up` : 'Any rating'}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={inStock}
                  onChange={handleStockChange}
                />
              }
              label="In Stock Only"
            />
          </Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default SearchFilters;
