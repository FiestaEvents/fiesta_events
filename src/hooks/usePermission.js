import { useAuth } from "../context/AuthContext";

export const usePermission = (requiredPermission) => {
  const { user } = useAuth();

  if (!user) return false;

  // 1. Owner Override (Always true)
  if (user.role?.name === "Owner" || user.role?.type === "owner") {
    return true;
  }

  // 2. Check the flattened permissions array
  // The backend now sends 'permissions' as an array of strings like ["events.read.all", "clients.create"]
  const userPermissions = user.permissions || [];

  if (Array.isArray(userPermissions)) {
    return userPermissions.includes(requiredPermission);
  }

  return false;
};