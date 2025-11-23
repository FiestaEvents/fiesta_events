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
  Star,
  AlignLeft,
  Award
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ✅ Generic Components
import Badge from '../../../components/common/Badge';

const PartnerInfo = ({ partner, formatDate }) => {
  const { t } = useTranslation();

  // Helper for Icon Rows
  const InfoRow = ({ icon: Icon, label, value, color = "blue", isBadge = false, badgeVariant = "secondary" }) => {
    if (!value) return null;

    const colorClasses = {
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
      gray: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };

    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
            {label}
          </div>
          
          {isBadge ? (
            <Badge variant={badgeVariant} className="capitalize">
              {value}
            </Badge>
          ) : (
            <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">
              {value}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Format Address Helper
  const formatAddress = (address) => {
    if (!address) return null;
    if (typeof address === 'string') return address;
    
    if (typeof address === 'object') {
      return [
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country
      ].filter(part => part && part.trim() !== '').join(', ');
    }
    return null;
  };

  // Category Color Mapper
  const getCategoryVariant = (cat) => {
    const map = {
      driver: "info", bakery: "warning", catering: "success", 
      decoration: "purple", photography: "purple", music: "info", 
      security: "danger", cleaning: "secondary", audio_visual: "primary",
      floral: "success", entertainment: "warning", hairstyling: "purple"
    };
    return map[cat?.toLowerCase()] || "secondary";
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-orange-500" />
        {t("partnerInfo.title", "Partner Details")}
      </h3>
      
      <div className="flex flex-col gap-1">
        
        {/* --- CONTACT INFO --- */}
        <InfoRow 
          icon={User} 
          label={t("partnerInfo.fields.contactPerson")} 
          value={partner.contactPerson} 
          color="blue" 
        />
        
        <InfoRow 
          icon={Mail} 
          label={t("partnerInfo.fields.email")} 
          value={partner.email} 
          color="orange" 
        />
        
        <InfoRow 
          icon={Phone} 
          label={t("partnerInfo.fields.phone")} 
          value={partner.phone} 
          color="green" 
        />
        
        <InfoRow 
          icon={MapPin} 
          label={t("partnerInfo.fields.address")} 
          value={formatAddress(partner.address) || partner.location} 
          color="purple" 
        />
        
        <InfoRow 
          icon={Globe} 
          label={t("partnerInfo.fields.website")} 
          value={partner.website} 
          color="gray" 
        />

        {/* --- BUSINESS INFO --- */}
        <InfoRow 
          icon={Building} 
          label={t("partnerInfo.fields.company")} 
          value={partner.company} 
          color="blue" 
        />
        
        <InfoRow 
          icon={Calendar} 
          label={t("partnerInfo.fields.joinedDate")} 
          value={formatDate(partner.createdAt)} 
          color="orange" 
        />
        
        <InfoRow 
          icon={Tag} 
          label={t("partnerInfo.fields.category")} 
          value={partner.category?.replace('_', ' ')} 
          color="purple"
          isBadge={true}
          badgeVariant={getCategoryVariant(partner.category)}
        />
        
        <InfoRow 
          icon={Star} 
          label={t("partnerInfo.fields.rating")} 
          value={partner.rating ? `${partner.rating.toFixed(1)} / 5.0` : null} 
          color="yellow" 
        />

        <InfoRow 
          icon={Award} 
          label={t("partnerInfo.fields.specialization")} 
          value={partner.specialization} 
          color="green" 
        />
      </div>

      {/* --- NOTES SECTION --- */}
      {partner.notes && (
        <div className="mt-6 space-y-2">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" />
              {t("partnerInfo.notes")}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed italic">
              "{partner.notes}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerInfo;