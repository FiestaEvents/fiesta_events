import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Store } from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // SMART NAVIGATION:
  // If the element exists on this page, scroll to it.
  // If not, navigate to the Home page with the anchor.
  const handleNavClick = (id, path = "/") => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    } else {
      // Navigate to the page where the section exists
      window.location.href = `${path}#${id}`;
      setIsMenuOpen(false);
    }
  };

  const handlePageNavigation = (path) => {
    window.location.href = path;
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handlePageNavigation("/")}
          >
            <img
              src="/fiesta logo-01.png"
              alt="Fiesta Logo"
              className="w-[100px] object-cover"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick("venue-system")}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Venue System
            </button>
            <button
              onClick={() => handleNavClick("features")}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              {t("landing.nav.features", "Features")}
            </button>
            <button
              onClick={() => handlePageNavigation("/marketplace")}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              {t("landing.nav.marketplace", "Marketplace")}
            </button>
            <button
              onClick={() => handleNavClick("contact")}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              {t("landing.nav.contact", "Contact")}
            </button>

            <LanguageSwitcher />

            <button
              onClick={() => handleNavClick("contact")}
              className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t animate-in slide-in-from-top duration-300">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => handleNavClick("venue-system")}
              className="block w-full text-left py-2 text-gray-700 font-medium border-b border-gray-100 hover:text-orange-600"
            >
              Venue System
            </button>
            <button
              onClick={() => handleNavClick("features")}
              className="block w-full text-left py-2 text-gray-700 font-medium border-b border-gray-100 hover:text-orange-600"
            >
              {t("landing.nav.features", "Features")}
            </button>
            <button
              onClick={() => handlePageNavigation("/marketplace")}
              className="block w-full text-left py-2 text-gray-700 font-medium border-b border-gray-100 hover:text-orange-600 flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              {t("landing.nav.marketplace", "Marketplace")}
            </button>
            <button
              onClick={() => handleNavClick("contact")}
              className="block w-full text-left py-2 text-orange-600 font-bold"
            >
              {t("landing.nav.contact", "Contact")}
            </button>
            <div className="pt-2 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
