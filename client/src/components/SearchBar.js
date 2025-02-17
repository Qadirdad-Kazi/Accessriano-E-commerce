import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { debounce } from "lodash";

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch suggestions when query changes
  const fetchSuggestions = debounce(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `/api/search/autocomplete?query=${searchQuery}`
      );
      setSuggestions(response.data.data);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Fetch popular searches on mount
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const response = await axios.get("/api/search/popular");
        setPopularSearches(response.data.data);
      } catch (error) {
        console.error("Failed to fetch popular searches:", error);
      }
    };

    fetchPopularSearches();
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (query) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (searchQuery) => {
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setQuery("");
      setAnchorEl(null);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(query);
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    setAnchorEl(event.currentTarget);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setAnchorEl(null);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: 600 }}>
      <Paper
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: "100%",
          backgroundColor: "white", // Ensure contrast with navbar
          border: "1px solid #ccc", // Add border for visibility
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <IconButton
          sx={{ p: "10px" }}
          aria-label="search"
          onClick={() => handleSearch(query)}
        >
          <SearchIcon color="primary" />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1, color: "black" }} // Ensure text is visible
          placeholder="Search products..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        {query && (
          <IconButton
            sx={{ p: "10px" }}
            aria-label="clear"
            onClick={handleClear}
          >
            <ClearIcon color="error" />
          </IconButton>
        )}
      </Paper>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper
            sx={{
              mt: 1,
              maxHeight: 400,
              overflow: "auto",
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {suggestions.length > 0 ? (
                  <List>
                    {suggestions.map((suggestion) => (
                      <ListItem
                        key={suggestion._id}
                        button
                        onClick={() => handleSearch(suggestion.name)}
                      >
                        <ListItemText
                          primary={suggestion.name}
                          secondary={suggestion.category}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : query ? (
                  <Box sx={{ p: 2, textAlign: "center", color: "gray" }}>
                    No suggestions found
                  </Box>
                ) : popularSearches.length > 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <TrendingIcon sx={{ mr: 1, fontSize: 20 }} />
                      Popular Searches
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {popularSearches.map((term, index) => (
                        <Chip
                          key={index}
                          label={term}
                          onClick={() => handleSearch(term)}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                ) : null}
              </>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default SearchBar;
