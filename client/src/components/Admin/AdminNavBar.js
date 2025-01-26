import React from "react";
import { Link } from "react-router-dom";
// import "./AdminNavBar.css";

const AdminNavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/admin">Admin Dashboard</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/products">Manage Products</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/orders">Manage Orders</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/users">Manage Users</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/reviews">Manage Reviews</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavBar;
