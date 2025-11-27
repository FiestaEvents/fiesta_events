import React from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  // Reusing the smart navigation logic for footer links
  const handleNavClick = (id, path = "/") => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `${path}#${id}`;
    }
  };

  const handlePageNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="flex flex-col items-start gap-4">
            <img
              src="/fiesta logo-01.png"
              alt="Fiesta Logo"
              className="w-[100px] object-cover"
            />
            <p className="text-gray-400 text-sm">
              The all-in-one management platform for venues in Tunisia.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold mb-4">
              {t("landing.footer.product", "Product")}
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <button
                  onClick={() => handleNavClick("venue-system")}
                  className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Venue System
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("features")}
                  className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("landing.nav.features", "Features")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePageNavigation("/marketplace")}
                  className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("landing.nav.marketplace", "Marketplace")}
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-4">
              {t("landing.footer.company", "Company")}
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                  {t("landing.footer.aboutUs", "About Us")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick("contact")}
                  className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t("landing.nav.contact", "Contact")}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold mb-4">
              {t("landing.footer.legal", "Legal")}
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                  {t("landing.footer.privacy", "Privacy Policy")}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                  {t("landing.footer.terms", "Terms of Service")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>
            {t("landing.footer.copyright", "© 2025 Fiesta Events.")}{" "}
            <Heart className="w-4 h-4 inline text-orange-500 animate-pulse" />{" "}
            {t("landing.footer.inTunisia", "Made in Tunisia")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
