// src/pages/roles/RoleDetails.jsx
import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const RoleDetails = ({ role, onEdit }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-3">
        <div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Role Name</div>
          <div className="text-gray-900 dark:text-white font-semibold text-lg">{role.name}</div>
        </div>

        <div>
          <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">Description</div>
          <div className="text-gray-900 dark:text-white">{role.description || '-'}</div>
        </div>

        <div>
          <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">Permissions</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {role.permissions && role.permissions.length > 0 ? (
              role.permissions.map((perm) => (
                <Badge key={perm.id} color="blue">{perm.name}</Badge>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">No permissions assigned</span>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onEdit}>Edit Role</Button>
      </div>
    </div>
  );
};

export default RoleDetails;
