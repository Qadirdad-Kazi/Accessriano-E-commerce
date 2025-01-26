import React from "react";
import { Link } from "react-router-dom";
// import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-4">
      <div className="container">
        <div className="row">
          {/* Quick Links */}
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light">Home</Link></li>
              <li><Link to="/shop" className="text-light">Shop</Link></li>
              <li><Link to="/about" className="text-light">About</Link></li>
              <li><Link to="/contact" className="text-light">Contact</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-4">
            <h5>Follow Us</h5>
            <ul className="list-unstyled d-flex">
              <li className="me-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-light">
                  <i className="fab fa-facebook-f"></i>
                </a>
              </li>
              <li className="me-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-light">
                  <i className="fab fa-twitter"></i>
                </a>
              </li>
              <li className="me-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-light">
                  <i className="fab fa-instagram"></i>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <p>Email: support@accessoriano.com</p>
            <p>Phone: +92 300 1234567</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-3">
          <p>&copy; 2025 Accessoriano. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
