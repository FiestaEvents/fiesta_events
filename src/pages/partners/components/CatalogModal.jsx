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
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

import Input from "../../../components/common/Input";
import PartnerCard from "./PartnerCard";
import CatalogModal from "./CatalogModal";
import OrbitLoader from "../../../components/common/LoadingSpinner";

const PartnerCatalog = ({ partners, loading }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  // State for Modal Navigation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <OrbitLoader />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Catalog Controls */}
      <div className="flex flex-col gap-6 items-center">
        <div className="max-w-xl w-full">
          <Input
            icon={Search}
            placeholder={t(
              "partners.catalog.searchPlaceholder",
              "Search catalog..."
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-lg py-3 rounded-full shadow-sm"
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
                   px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                   ${
                     selectedCategory === cat
                       ? "bg-orange-600 text-white shadow-lg scale-105"
                       : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700"
                   }
                 `}
              >
                {cat !== "all" && <Icon size={14} />}
                <span className="capitalize">
                  {cat === "all"
                    ? t("common.all")
                    : t(`partners.categories.${cat}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. The Grid */}
      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPartners.map((partner, index) => (
            <PartnerCard
              key={partner._id}
              partner={partner}
              onClick={() => handleCardClick(index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            {t("partners.catalog.noResults", "No partners found")}
          </h3>
        </div>
      )}

      {/* 3. The Smart Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CatalogModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            partners={filteredPartners} // Pass the filtered list
            currentIndex={selectedIndex} // Current position
            onNavigate={setSelectedIndex} // Function to update position
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerCatalog;
