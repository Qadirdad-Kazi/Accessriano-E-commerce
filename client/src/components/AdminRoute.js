import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../components/context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Check if user is authenticated and isAdmin
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
