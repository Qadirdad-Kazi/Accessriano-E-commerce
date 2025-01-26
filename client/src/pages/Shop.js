import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      const query = new URLSearchParams(location.search).get("search");
      const endpoint = query
        ? `http://localhost:5000/api/products/search?query=${query}`
        : "http://localhost:5000/api/products";
      try {
        const response = await axios.get(endpoint);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [location.search]);

  return (
    <div className="shop-container">
      <h1 className="shop-title">Shop All Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Shop;
