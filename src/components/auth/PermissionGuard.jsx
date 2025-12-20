import React from 'react';
import { usePermission } from '../../hooks/usePermission';

/**
 * @param {string} permission - The permission string required (e.g. "events.create")
 * @param {boolean} requireAll - If checking multiple permissions, do we need all of them?
 * @param {ReactNode} fallback - What to render if permission is denied (optional)
 */
const PermissionGuard = ({ 
  permission, 
  children, 
  fallback = null, 
  renderIf // Optional: pass a boolean condition that ignores permission (e.g. isOwner)
}) => {
  const hasPermission = usePermission(permission);

  // If renderIf is provided and true, show children regardless of permission
  if (renderIf) return <>{children}</>;

  if (!hasPermission) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;