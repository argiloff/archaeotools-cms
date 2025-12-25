import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';

type Props = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: Props) {
  const { accessToken } = useAuth();
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
