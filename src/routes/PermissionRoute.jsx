import { Navigate, Outlet } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';

const PermissionRoute = ({ permission }) => {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default PermissionRoute;