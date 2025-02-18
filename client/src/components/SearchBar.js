import React, { useState, useEffect, useRef } from "react";
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Popper,
  ClickAwayListener,
  CircularProgress,
  Typography,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(recent);
    fetchPopularSearches();
  }, []);

  const fetchPopularSearches = async () => {
    try {
      const response = await api.get("/search/popular");
      setPopularSearches(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch popular searches:", error);
    }
  };

  // Save recent searches to localStorage
  const updateRecentSearches = (searchQuery) => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    const updated = [searchQuery, ...recent.filter(s => s !== searchQuery)].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSuggestions(response.data.data || []);
      updateRecentSearches(searchQuery);
    } catch (error) {
      setError("Failed to fetch search results");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useRef(
    debounce((query) => handleSearch(query), 300)
  ).current;

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setAnchorEl(event.currentTarget);
    
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      updateRecentSearches(query);
      handleClose();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    updateRecentSearches(suggestion);
    setQuery(suggestion);
    handleClose();
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSuggestions([]);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: 600, mx: "auto" }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%",
          borderRadius: 20,
        }}
        elevation={1}
      >
        <IconButton type="submit" sx={{ p: "10px" }}>
          <SearchIcon />
        </IconButton>
        <InputBase
          inputRef={inputRef}
          value={query}
          onChange={handleInputChange}
          placeholder="Search products..."
          sx={{ ml: 1, flex: 1 }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        />
        {query && (
          <IconButton onClick={handleClear} sx={{ p: "10px" }}>
            <ClearIcon />
          </IconButton>
        )}
      </Paper>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper sx={{ mt: 1, maxHeight: 400, overflow: "auto" }}>
            <AnimatePresence>
              {loading ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ p: 2 }}>
                  {error}
                </Typography>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {!query && (
                    <>
                      {popularSearches.length > 0 && (
                        <>
                          <Box sx={{ p: 1.5, pb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              color="textSecondary"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <TrendingIcon sx={{ mr: 1, fontSize: 20 }} />
                              Popular Searches
                            </Typography>
                          </Box>
                          <Box sx={{ p: 1 }}>
                            {popularSearches.map((term, index) => (
                              <Chip
                                key={index}
                                label={term}
                                onClick={() => handleSuggestionClick(term)}
                                sx={{ m: 0.5 }}
                              />
                            ))}
                          </Box>
                          <Divider />
                        </>
                      )}
                      {recentSearches.length > 0 && (
                        <>
                          <Box sx={{ p: 1.5, pb: 0.5 }}>
                            <Typography
                              variant="subtitle2"
                              color="textSecondary"
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              <HistoryIcon sx={{ mr: 1, fontSize: 20 }} />
                              Recent Searches
                            </Typography>
                          </Box>
                          <List dense>
                            {recentSearches.map((term, index) => (
                              <ListItem
                                key={index}
                                button
                                onClick={() => handleSuggestionClick(term)}
                              >
                                <ListItemText primary={term} />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </>
                  )}
                  {suggestions.length > 0 && (
                    <List dense>
                      {suggestions.map((suggestion, index) => (
                        <ListItem
                          key={index}
                          button
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {query && !loading && suggestions.length === 0 && (
                    <Typography sx={{ p: 2, textAlign: "center" }}>
                      No results found
                    </Typography>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default SearchBar;
