import { useMemo } from 'react';
import { useAuth } from './useAuth.jsx';

export const usePermission = (permissionName) => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user?.permissions) return false;
    return user.permissions.some(p => p.name === permissionName);
  }, [user, permissionName]);
};

export const usePermissions = (permissionNames = []) => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user?.permissions) return {};
    
    return permissionNames.reduce((acc, permName) => {
      acc[permName] = user.permissions.some(p => p.name === permName);
      return acc;
    }, {});
  }, [user, permissionNames]);
};