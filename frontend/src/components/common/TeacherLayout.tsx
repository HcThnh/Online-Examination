import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppHeader from './AppHeader';

/**
 * TeacherLayout — wraps all authenticated teacher routes.
 * - Renders <AppHeader /> fixed at top.
 * - Redirects unauthenticated users to /login.
 * - Adds pt-16 so page content clears the fixed header.
 */
const TeacherLayout: React.FC = () => {
  const { token } = useAuth();

  // Guard: redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AppHeader />
      {/* pt-16 matches header height (h-16) */}
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default TeacherLayout;
