import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Spinner } from '../ui/Feedback';

/** Signed-in gate. Waits for the session probe before deciding. */
export const RequireAuth = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
};

/** Admin console gate — session marker is set by the admin sign-in flow. */
export const RequireAdmin = ({ children }) => {
  if (!localStorage.getItem('adminToken')) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};
