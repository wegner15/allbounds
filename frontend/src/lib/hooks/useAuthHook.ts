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
      const loggedInUser = await auth.login(email, password);

      // Determine appropriate target based on user roles
      const isFinanceOnly = !loggedInUser?.is_superuser && loggedInUser?.roles?.some(r => r.name === 'finance');
      const defaultPath = isFinanceOnly ? '/admin/finance' : '/admin/dashboard';
      const targetPath = redirectPath || defaultPath;

      console.log(`Login successful, redirecting to ${targetPath}`);

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
  
  // Check if user is an administrator
  const isAdmin = (): boolean => !!auth.user?.is_superuser;

  // Check if user has finance access (either superuser or finance role)
  const isFinanceUser = (): boolean => {
    if (!auth.user) return false;
    if (auth.user.is_superuser) return true;
    return auth.user.roles?.some(r => r.name === 'finance') ?? false;
  };

  // Check if user has required role
  const hasRole = (roleName?: string): boolean => {
    if (!auth.user) return false;
    if (auth.user.is_superuser) return true;
    if (!roleName) return false;
    return auth.user.roles?.some(r => r.name === roleName) ?? false;
  };
  
  // Check if user has required permission
  const hasPermission = (permissionName?: string): boolean => {
    if (!auth.user) return false;
    if (auth.user.is_superuser) return true;
    // Superusers have all permissions
    return false;
  };
  
  return {
    ...auth,
    handleLogin,
    handleLogout,
    isSubmitting,
    isAdmin,
    isFinanceUser,
    hasRole,
    hasPermission,
  };
};

export default useAuthHook;
