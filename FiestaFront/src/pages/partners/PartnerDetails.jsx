import React from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const PartnerDetails = ({ partner, onEdit }) => {
  if (!partner) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {partner.name || 'Unnamed Partner'}
        </h2>
        <Badge color={partner.status === 'active' ? 'green' : 'gray'}>
          {partner.status || 'inactive'}
        </Badge>
      </div>

      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p><span className="font-medium">Company:</span> {partner.company || '-'}</p>
        <p><span className="font-medium">Type:</span> {partner.type || 'vendor'}</p>
        <p><span className="font-medium">Email:</span> {partner.email || '-'}</p>
        <p><span className="font-medium">Phone:</span> {partner.phone || '-'}</p>
        <p><span className="font-medium">Address:</span> {partner.address || '-'}</p>
        <p><span className="font-medium">Notes:</span> {partner.notes || 'No notes available.'}</p>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onEdit}>Edit Partner</Button>
      </div>
    </div>
  );
};

export default PartnerDetails;
