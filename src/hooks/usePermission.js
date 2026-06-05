import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermission = (requiredPermission) => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.permissions) return false;
    
    if (user.role?.name === 'Owner' || user.isSuperAdmin) return true;

    return user.permissions.some(p => {
      const name = typeof p === 'string' ? p : p.name;
      return name === requiredPermission;
    });
  }, [user, requiredPermission]);
};