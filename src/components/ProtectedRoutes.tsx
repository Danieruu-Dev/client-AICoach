import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRoutesProps {
  isAuthenticated: boolean;
}

function ProtectedRoutes({ isAuthenticated }: ProtectedRoutesProps) {
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/authentication" replace />
  );
}

export default ProtectedRoutes;
