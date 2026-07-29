import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
                <span className="text-body-sm text-on-surface-variant">Loading your workspace…</span>
            </div>
        );
    }

    if (!user) {
        const loginRole = allowedRoles?.length === 1 ? allowedRoles[0] : null;
        return <Navigate to={loginRole ? `/login?role=${loginRole}` : '/login'} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'client') {
            return <Navigate to="/client-dashboard" replace />;
        }
        if (user.role === 'freelancer') {
            return <Navigate to="/freelancer/dashboard" replace />;
        }
        // Fallback for missing/unknown roles
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
