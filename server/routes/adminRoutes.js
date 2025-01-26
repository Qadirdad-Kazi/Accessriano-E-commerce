import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../components/context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user || !user.isAdmin) {
    // Redirect to login page if not authenticated or not admin
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
