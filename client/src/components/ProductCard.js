import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  return (
    <div className="card product-card">
      <img
        src={product.image}
        className="card-img-top"
        alt={product.name}
      />
      <div className="card-body">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text">${product.price}</p>
        <div className="btn-group">
          <button className="btn btn-primary">Add to Cart</button>
          <Link to={`/product/${product._id}`} className="btn btn-secondary">View</Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
