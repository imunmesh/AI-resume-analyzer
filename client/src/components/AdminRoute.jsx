import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from './LoadingSpinner';

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <FullPageSpinner text="Verifying access..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
