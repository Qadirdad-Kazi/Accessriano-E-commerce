import React from "react";
// import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="container mt-5">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <div className="row">
        <div className="col-md-3">
          <div className="card bg-primary text-white text-center">
            <h4>Total Products</h4>
            <p>50</p> {/* Replace with dynamic value */}
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white text-center">
            <h4>Total Orders</h4>
            <p>120</p> {/* Replace with dynamic value */}
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white text-center">
            <h4>Total Users</h4>
            <p>300</p> {/* Replace with dynamic value */}
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white text-center">
            <h4>Total Revenue</h4>
            <p>$10,000</p> {/* Replace with dynamic value */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
