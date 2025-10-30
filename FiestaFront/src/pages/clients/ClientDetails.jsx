import React from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const ClientDetails = ({ client, onEdit }) => {
  if (!client) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {client.name || 'Unnamed Client'}
        </h2>
        <Badge
          color={
            client.status === 'active'
              ? 'green'
              : client.status === 'inactive'
              ? 'gray'
              : 'yellow'
          }
        >
          {client.status || 'N/A'}
        </Badge>
      </div>

      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p>
          <span className="font-medium">Email:</span>{' '}
          {client.email || 'Not provided'}
        </p>
        <p>
          <span className="font-medium">Phone:</span>{' '}
          {client.phone || 'Not provided'}
        </p>
        <p>
          <span className="font-medium">Company:</span>{' '}
          {client.company || 'Not provided'}
        </p>
        <p>
          <span className="font-medium">Address:</span>{' '}
          {client.address || 'Not provided'}
        </p>
        <p>
          <span className="font-medium">Notes:</span>{' '}
          {client.notes || 'No notes available.'}
        </p>
        <p>
          <span className="font-medium">Created:</span>{' '}
          {client.createdAt
            ? new Date(client.createdAt).toLocaleDateString()
            : '-'}
        </p>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onEdit}>Edit Client</Button>
      </div>
    </div>
  );
};

export default ClientDetails;
