import {
  ArrowRight,
  Calendar,
  Check,
  FileText,
  PieChart,
  Star,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "../../components/website/Footer";
import Navbar from "../../components/website/Navbar";
import { useLanguage } from "../../context/LanguageContext";

// Reusing the paths from your previous request
const screenshots = {
  calendar: "/screenshots/calendar-view.png",
  finance: "/screenshots/finance-overview.png",
  invoice: "/screenshots/invoice-builder.png",
  contract: "/screenshots/contract-view.png",
};

const FiestaVenue = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("calendar");

  // Scroll to pricing section
  const scrollToPricing = () => {
    document
      .getElementById("pricing-plans")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-600">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-100/40 skew-x-12 transform translate-x-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-200 rounded-full text-orange-700 text-sm font-bold mb-6">
                <Star className="w-4 h-4 fill-orange-600" />
                <span>{t("fiestaVenue.hero.badge")}</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
                {t("fiestaVenue.hero.title.line1")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">
                  {t("fiestaVenue.hero.title.line2")}
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t("fiestaVenue.hero.description.line1")}
                <span className="block mt-2 font-semibold text-gray-800">
                  {t("fiestaVenue.hero.description.line2")}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={scrollToPricing}
                  className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  {t("fiestaVenue.hero.buttons.startFree")}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-orange-600 hover:text-orange-600 transition-all bg-white">
                  {t("fiestaVenue.hero.buttons.watchDemo")}
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  {t("fiestaVenue.hero.features.noCreditCard")}
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  {t("fiestaVenue.hero.features.quickSetup")}
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-pink-500 rounded-2xl rotate-3 blur-lg opacity-30"></div>
              <img
                src={screenshots.calendar}
                alt={t("fiestaVenue.hero.imageAlt")}
                className="relative rounded-2xl shadow-2xl border-4 border-white w-full transform hover:scale-[1.01] transition-transform duration-500"
              />

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">
                    {t("fiestaVenue.hero.floatingBadge.label")}
                  </div>
                  <div className="font-bold text-gray-900">
                    {t("fiestaVenue.hero.floatingBadge.value")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROBLEM / AGITATION --- */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">
            {t("fiestaVenue.problem.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                😫
              </div>
              <h3 className="font-bold mb-2 text-red-900">
                {t("fiestaVenue.problem.items.doubleBookings.title")}
              </h3>
              <p className="text-sm text-red-700">
                {t("fiestaVenue.problem.items.doubleBookings.description")}
              </p>
            </div>
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                💸
              </div>
              <h3 className="font-bold mb-2 text-red-900">
                {t("fiestaVenue.problem.items.lostPayments.title")}
              </h3>
              <p className="text-sm text-red-700">
                {t("fiestaVenue.problem.items.lostPayments.description")}
              </p>
            </div>
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📝
              </div>
              <h3 className="font-bold mb-2 text-red-900">
                {t("fiestaVenue.problem.items.messyContracts.title")}
              </h3>
              <p className="text-sm text-red-700">
                {t("fiestaVenue.problem.items.messyContracts.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES TABBED SECTION --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {t("fiestaVenue.features.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("fiestaVenue.features.subtitle")}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Tabs */}
            <div className="lg:w-1/3 space-y-4">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`w-full text-left p-6 rounded-xl transition-all border-l-4 ${activeTab === "calendar" ? "bg-white shadow-lg border-orange-500" : "hover:bg-white border-transparent"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar
                    className={`w-6 h-6 ${activeTab === "calendar" ? "text-orange-500" : "text-gray-400"}`}
                  />
                  <h3
                    className={`font-bold text-lg ${activeTab === "calendar" ? "text-gray-900" : "text-gray-600"}`}
                  >
                    {t("fiestaVenue.features.tabs.calendar.title")}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 pl-9">
                  {t("fiestaVenue.features.tabs.calendar.description")}
                </p>
                <span className="ml-9 mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                  {t("fiestaVenue.features.tabs.calendar.badge")}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("finance")}
                className={`w-full text-left p-6 rounded-xl transition-all border-l-4 ${activeTab === "finance" ? "bg-white shadow-lg border-orange-500" : "hover:bg-white border-transparent"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <PieChart
                    className={`w-6 h-6 ${activeTab === "finance" ? "text-orange-500" : "text-gray-400"}`}
                  />
                  <h3
                    className={`font-bold text-lg ${activeTab === "finance" ? "text-gray-900" : "text-gray-600"}`}
                  >
                    {t("fiestaVenue.features.tabs.finance.title")}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 pl-9">
                  {t("fiestaVenue.features.tabs.finance.description")}
                </p>
                <span className="ml-9 mt-2 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                  {t("fiestaVenue.features.tabs.finance.badge")}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("legal")}
                className={`w-full text-left p-6 rounded-xl transition-all border-l-4 ${activeTab === "legal" ? "bg-white shadow-lg border-orange-500" : "hover:bg-white border-transparent"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText
                    className={`w-6 h-6 ${activeTab === "legal" ? "text-orange-500" : "text-gray-400"}`}
                  />
                  <h3
                    className={`font-bold text-lg ${activeTab === "legal" ? "text-gray-900" : "text-gray-600"}`}
                  >
                    {t("fiestaVenue.features.tabs.legal.title")}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 pl-9">
                  {t("fiestaVenue.features.tabs.legal.description")}
                </p>
                <span className="ml-9 mt-2 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                  {t("fiestaVenue.features.tabs.legal.badge")}
                </span>
              </button>
            </div>

            {/* Preview Window */}
            <div className="lg:w-2/3">
              <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl border border-gray-800">
                <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden">
                  <img
                    src={
                      activeTab === "calendar"
                        ? screenshots.calendar
                        : activeTab === "finance"
                          ? screenshots.finance
                          : screenshots.contract
                    }
                    alt={t("fiestaVenue.features.previewAlt")}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Feature Details Text */}
              <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100">
                {activeTab === "calendar" && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold mb-3">
                      {t("fiestaVenue.features.details.calendar.title")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("fiestaVenue.features.details.calendar.description")}
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {t(
                          "fiestaVenue.features.details.calendar.features.dragDrop"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {t(
                          "fiestaVenue.features.details.calendar.features.eventStatus"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {t(
                          "fiestaVenue.features.details.calendar.features.clientView"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {t(
                          "fiestaVenue.features.details.calendar.features.mobile"
                        )}
                      </li>
                    </ul>
                  </div>
                )}
                {activeTab === "finance" && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold mb-3">
                      {t("fiestaVenue.features.details.finance.title")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("fiestaVenue.features.details.finance.description")}
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t(
                          "fiestaVenue.features.details.finance.features.invoices"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t(
                          "fiestaVenue.features.details.finance.features.paymentTracking"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t(
                          "fiestaVenue.features.details.finance.features.expenseManagement"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t(
                          "fiestaVenue.features.details.finance.features.reports"
                        )}
                      </li>
                    </ul>
                  </div>
                )}
                {activeTab === "legal" && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold mb-3">
                      {t("fiestaVenue.features.details.legal.title")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("fiestaVenue.features.details.legal.description")}
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t(
                          "fiestaVenue.features.details.legal.features.templates"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t(
                          "fiestaVenue.features.details.legal.features.autoFill"
                        )}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t("fiestaVenue.features.details.legal.features.pdf")}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" />
                        {t(
                          "fiestaVenue.features.details.legal.features.archives"
                        )}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section
        id="pricing-plans"
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-50 to-gray-50 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {t("fiestaVenue.pricing.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("fiestaVenue.pricing.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all relative">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {t("fiestaVenue.pricing.plans.starter.title")}
              </h3>
              <p className="text-gray-500 mb-6">
                {t("fiestaVenue.pricing.plans.starter.description")}
              </p>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  {t("fiestaVenue.pricing.plans.starter.price")}
                </span>
                <span className="text-gray-500">
                  {t("fiestaVenue.pricing.plans.starter.period")}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    {t("fiestaVenue.pricing.plans.starter.features.events")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    {t("fiestaVenue.pricing.plans.starter.features.crm")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    {t("fiestaVenue.pricing.plans.starter.features.dashboard")}
                  </span>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <div className="p-1 bg-gray-100 rounded-full">
                    <X className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-gray-400 line-through">
                    {t("fiestaVenue.pricing.plans.starter.features.reports")}
                  </span>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <div className="p-1 bg-gray-100 rounded-full">
                    <X className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-gray-400 line-through">
                    {t("fiestaVenue.pricing.plans.starter.features.invoices")}
                  </span>
                </div>
              </div>

              <button className="w-full py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                {t("fiestaVenue.pricing.plans.starter.button")}
              </button>
            </div>

            {/* PRO PLAN */}
            <div className="bg-gray-900 p-8 rounded-3xl border-2 border-orange-500 shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-2xl">
                {t("fiestaVenue.pricing.plans.pro.badge")}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {t("fiestaVenue.pricing.plans.pro.title")}
              </h3>
              <p className="text-gray-400 mb-6">
                {t("fiestaVenue.pricing.plans.pro.description")}
              </p>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  {t("fiestaVenue.pricing.plans.pro.price")}
                </span>
                <span className="text-gray-400 block text-sm mt-1">
                  {t("fiestaVenue.pricing.plans.pro.contact")}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange-600 rounded-full">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white">
                    {t("fiestaVenue.pricing.plans.pro.features.starter")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">
                    {t("fiestaVenue.pricing.plans.pro.features.reports")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">
                    {t("fiestaVenue.pricing.plans.pro.features.invoices")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">
                    {t("fiestaVenue.pricing.plans.pro.features.contracts")}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">
                    {t("fiestaVenue.pricing.plans.pro.features.staff")}
                  </span>
                </div>
              </div>

              <button className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-900/50">
                {t("fiestaVenue.pricing.plans.pro.button")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            {t("fiestaVenue.faq.title")}
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                {t("fiestaVenue.faq.questions.freeForever.q")}
              </h3>
              <p className="text-gray-600">
                {t("fiestaVenue.faq.questions.freeForever.a")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                {t("fiestaVenue.faq.questions.dataSecurity.q")}
              </h3>
              <p className="text-gray-600">
                {t("fiestaVenue.faq.questions.dataSecurity.a")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                {t("fiestaVenue.faq.questions.dataExport.q")}
              </h3>
              <p className="text-gray-600">
                {t("fiestaVenue.faq.questions.dataExport.a")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-orange-600 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                {t("fiestaVenue.cta.title")}
              </h2>
              <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
                {t("fiestaVenue.cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
                  {t("fiestaVenue.cta.buttons.startFree")}
                </button>
                <button className="bg-orange-700 text-white border border-orange-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-800 transition-colors">
                  {t("fiestaVenue.cta.buttons.contactSales")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FiestaVenue;
