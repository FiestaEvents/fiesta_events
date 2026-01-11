import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Camera,
  Music,
  Truck,
  Shield,
  Utensils,
  Brush,
  Image as ImageIcon,
  Briefcase,
  Filter,
} from "lucide-react";
import Input from "../../../components/common/Input";
import OrbitLoader from "../../../components/common/LoadingSpinner";
import PartnerCard from "./PartnerCard";
import PartnerBookViewer from "./PartnerBookViewer";

const PartnerCatalog = ({ partners, loading, onEditPortfolio }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const getCategoryIcon = (cat) => {
    const map = {
      photography: Camera,
      music: Music,
      driver: Truck,
      security: Shield,
      catering: Utensils,
      decoration: Brush,
    };
    return map[cat] || Briefcase;
  };

  const categories = useMemo(() => {
    const unique = [...new Set(partners.map((p) => p.category))];
    return ["all", ...unique.sort()];
  }, [partners]);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchCat =
        selectedCategory === "all" || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [partners, selectedCategory, search]);

  const handleCardClick = (index) => {
    setStartIndex(index); // Set where the book starts
    setIsViewerOpen(true);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <OrbitLoader />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Header & Filters */}
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative w-full max-w-xl">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent sm:text-sm shadow-sm transition-shadow"
            placeholder={t(
              "partners.catalog.searchPlaceholder",
              "Find your perfect partner..."
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                   px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 border
                   ${
                     selectedCategory === cat
                       ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-lg transform scale-105"
                       : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50"
                   }
                 `}
              >
                {cat !== "all" && <Icon size={14} />}
                <span className="capitalize">
                  {cat === "all" ? t("common.all") : cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. The Grid */}
      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {filteredPartners.map((partner, index) => (
            <PartnerCard
              key={partner._id}
              partner={partner}
              onClick={() => handleCardClick(index)} 
               onEditPortfolio={onEditPortfolio}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("partners.catalog.noResults", "No partners found")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Try adjusting your filters
          </p>
        </div>
      )}

      {/* 3. The Book Viewer Overlay */}
      <PartnerBookViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        partners={filteredPartners} // Pass the filtered list so navigation matches the grid
        startIndex={startIndex}
      />
    </div>
  );
};

export default PartnerCatalog;
