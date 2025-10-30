// src/pages/team/TeamDetails.jsx
import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { UserIcon } from '../../components/icons/IconComponents';
import Badge from '../../components/common/Badge';

const TeamDetails = ({ member, onEdit }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
        <UserIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
        <div className="flex-1 space-y-1">
          <div className="text-gray-600 dark:text-gray-400 text-sm">Full Name</div>
          <div className="text-gray-900 dark:text-white font-semibold text-lg">{member.name}</div>

          <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">Email</div>
          <div className="text-gray-900 dark:text-white font-medium">{member.email}</div>

          <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">Role</div>
          <div className="text-gray-900 dark:text-white font-medium">{member.role}</div>

          <div className="text-gray-600 dark:text-gray-400 text-sm mt-2">Status</div>
          <Badge color={member.status === 'active' ? 'green' : 'yellow'}>{member.status}</Badge>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onEdit}>
          Edit Member
        </Button>
      </div>
    </div>
  );
};

export default TeamDetails;
