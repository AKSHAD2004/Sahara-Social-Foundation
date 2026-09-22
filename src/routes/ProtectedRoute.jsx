// Protected Route Guard for CRM Role-Based Navigation
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="crm-loading-screen">
        <div className="crm-spinner"></div>
        <p>Verifying secure session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  // Super Admin can access everything
  if (currentUser.role === 'super_admin') {
    return children;
  }

  // If specific roles are required
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // If affiliate is trying to access admin pages, redirect to affiliate portal
    if (currentUser.role === 'affiliate' && !location.pathname.startsWith('/crm/affiliate-portal')) {
      return <Navigate to="/crm/affiliate-portal" replace />;
    }

    return (
      <div className="crm-access-denied">
        <div className="access-denied-card">
          <ShieldAlert size={48} className="text-danger" />
          <h2>Access Restricted</h2>
          <p>
            Your current role (<strong>{currentUser.role.replace('_', ' ').toUpperCase()}</strong>) does not have
            permission to view this section.
          </p>
          <div className="actions">
            <a href="/crm" className="crm-btn crm-btn-primary">Return to CRM Home</a>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
