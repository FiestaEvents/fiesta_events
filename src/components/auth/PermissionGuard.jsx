import React from 'react';
import { usePermission } from '../../hooks/usePermission';

const PermissionGuard = ({ permission, children, fallback = null }) => {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;