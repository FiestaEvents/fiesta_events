import React from "react";
import { Star, MapPin, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

const getPlaceholder = (name, cat) =>
  `https://source.unsplash.com/random/400x300/?${cat || "event"},${name}`;

const PartnerCard = ({ partner, onClick, onEditPortfolio }) => {
  const { t } = useTranslation();

  const coverImage =
    partner.portfolio?.[0]?.url ||
    getPlaceholder(partner.name, partner.category);

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={coverImage}
          alt={partner.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Category Tag */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white shadow-sm z-10">
          {t(`partners.categories.${partner.category}`) || partner.category}
        </div>

        {/*  QUICK EDIT BUTTON (Only shows if onEditPortfolio is provided) */}
        {onEditPortfolio && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Stop card click
              onEditPortfolio(partner);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-200 shadow-lg opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-500 hover:text-white z-20"
            title={t("partners.portfolio.manage", "Manage Portfolio")}
          >
            <Camera size={18} />
          </button>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          {partner.rating?.toFixed(1) || "New"}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
          {partner.name}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-3">
          <MapPin size={12} />
          <span className="truncate">
            {partner.city || "Tunis"}, {partner.country || "Tunisia"}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 flex-1">
          {partner.description || t("partners.catalog.noDescription")}
        </p>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {partner.priceType === "hourly"
              ? `${partner.hourlyRate} TND/hr`
              : `${partner.fixedRate} TND`}
          </div>
          <span className="text-orange-600 text-xs font-bold group-hover:underline">
            {t("common.view")} →
          </span>
        </div>
      </div>
    </div>
  );
};

export default PartnerCard;
