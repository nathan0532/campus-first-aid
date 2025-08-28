import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const location = useLocation();

  // 检查是否已登录
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查管理员权限
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;