import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Building, 
  Calendar,
  Tag,
  Star
} from 'lucide-react';

const PartnerInfo = ({ partner, formatDate, getCategoryColor }) => {
  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-sm text-gray-900 dark:text-white break-words">
          {value || '-'}
        </p>
      </div>
    </div>
  );

  const formatAddress = (address) => {
    if (!address) return '-';
    
    if (typeof address === 'string') return address;
    
    if (typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country
      ].filter(part => part && part.trim() !== '');
      
      return parts.join(', ');
    }
    
    return '-';
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Partner Information
      </h3>
      
      <div className="space-y-1">
        {partner.contactPerson && (
          <DetailItem label="Contact Person" value={partner.contactPerson} icon={User} />
        )}
        
        {partner.email && (
          <DetailItem label="Email" value={partner.email} icon={Mail} />
        )}
        
        {partner.phone && (
          <DetailItem label="Phone" value={partner.phone} icon={Phone} />
        )}
        
        {partner.address && (
          <DetailItem 
            label="Address" 
            value={formatAddress(partner.address)} 
            icon={MapPin} 
          />
        )}
        
        {partner.website && (
          <DetailItem label="Website" value={partner.website} icon={Globe} />
        )}
        
        {partner.company && (
          <DetailItem label="Company" value={partner.company} icon={Building} />
        )}
        
        <DetailItem 
          label="Joined Date" 
          value={formatDate(partner.createdAt)} 
          icon={Calendar} 
        />
        
        {partner.category && (
          <DetailItem 
            label="Category" 
            value={partner.category.replace('_', ' ')} 
            icon={Tag} 
          />
        )}
        
        {partner.rating && (
          <DetailItem 
            label="Rating" 
            value={`${partner.rating.toFixed(1)} / 5.0`} 
            icon={Star} 
          />
        )}
        
        {partner.specialization && (
          <DetailItem 
            label="Specialization" 
            value={partner.specialization} 
            icon={Star} 
          />
        )}
      </div>

      {/* Additional Notes */}
      {partner.notes && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Additional Notes
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {partner.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default PartnerInfo;