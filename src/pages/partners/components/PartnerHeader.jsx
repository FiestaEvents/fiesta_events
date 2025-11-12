// components/partners/PartnerHeader.jsx
import { ArrowLeft, Edit, Trash2, Building } from "lucide-react";
import Button from "../../../components/common/Button";

const PartnerHeader = ({
  partner,
  onBack,
  onEdit,
  onDelete,
  getStatusColor,
  getStatusLabel,
  getCategoryColor,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            icon={ArrowLeft}
            className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
          >
            Back to Partners
          </Button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {partner.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {partner.company && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4 mr-1" />
                  {partner.company}
                </div>
              )}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium dark:text-white ${getCategoryColor(partner.type || partner.category)}`}
              >
                {(partner.type || partner.category)
                  ?.replace("_", " ")
                  .toUpperCase() || "OTHER"}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}
              >
                {getStatusLabel(partner.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={Edit}
            onClick={onEdit}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-600 hover:text-orange-600"
          >
            Edit Partner
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartnerHeader;
