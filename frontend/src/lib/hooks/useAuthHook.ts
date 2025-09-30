import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export const useAuthHook = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle login with redirection
  const handleLogin = async (email: string, password: string, redirectPath?: string) => {
    setIsSubmitting(true);
    try {
      await auth.login(email, password);

      // After successful login, redirect to admin dashboard
      const targetPath = '/admin/dashboard';
      console.log('Login successful, redirecting to dashboard');

      // Navigate to the target path
      navigate(targetPath, { replace: true });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle logout with redirection
  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };
  
  // Check if user has required role
  const hasRole = (): boolean => {
    if (!auth.user) return false;
    
    // For superusers, grant access to everything
    if (auth.user.is_superuser) return true;
    
    // For regular users, check roles (would need to be expanded based on your role structure)
    // This is a placeholder implementation
    return false;
  };
  
  // Check if user has required permission
  const hasPermission = (): boolean => {
    if (!auth.user) return false;
    
    // For superusers, grant access to everything
    if (auth.user.is_superuser) return true;
    
    // For regular users, check permissions (would need to be expanded based on your permission structure)
    // This is a placeholder implementation
    return false;
  };
  
  return {
    ...auth,
    handleLogin,
    handleLogout,
    isSubmitting,
    hasRole,
    hasPermission,
  };
};

export default useAuthHook;
