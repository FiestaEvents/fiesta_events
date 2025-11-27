import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  X,
  Calendar,
  Users,
  PieChart,
  FileText,
  CreditCard,
  LayoutList,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Lock,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import Footer from "../../components/website/Footer";
import Navbar from "../../components/website/Navbar";

// Reusing the paths from your previous request
const screenshots = {
  calendar: "/screenshots/calendar-view.png",
  finance: "/screenshots/finance-overview.png",
  invoice: "/screenshots/invoice-builder.png",
  contract: "/screenshots/contract-view.png",
};

const FiestaVenue = () => {
  const { t } = useTranslation(); // Assuming translation setup
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
      {/* Note: Ensure your Navbar component handles the transparent/scrolled state if needed */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-100/40 skew-x-12 transform translate-x-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-200 rounded-full text-orange-700 text-sm font-bold mb-6">
                <Star className="w-4 h-4 fill-orange-600" />
                <span>The #1 Venue Management System</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
                Stop Managing. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500">
                  Start Scaling.
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Ditch the notebook and the messy Excel sheets. Fiesta gives you
                a professional digital command center.
                <span className="block mt-2 font-semibold text-gray-800">
                  Start for free, upgrade when you grow.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={scrollToPricing}
                  className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  Start For Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-orange-600 hover:text-orange-600 transition-all bg-white">
                  Watch Demo
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" /> No credit card
                  required
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" /> Setup in 2
                  minutes
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-pink-500 rounded-2xl rotate-3 blur-lg opacity-30"></div>
              <img
                src={screenshots.calendar}
                alt="Fiesta Calendar Interface"
                className="relative rounded-2xl shadow-2xl border-4 border-white w-full transform hover:scale-[1.01] transition-transform duration-500"
              />

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">
                    Productivity Boost
                  </div>
                  <div className="font-bold text-gray-900">+40% Time Saved</div>
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
            Is your venue running you, or are you running your venue?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                😫
              </div>
              <h3 className="font-bold mb-2 text-red-900">Double Bookings</h3>
              <p className="text-sm text-red-700">
                The nightmare of explaining to a client that their date was
                accidentally given to someone else.
              </p>
            </div>
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                💸
              </div>
              <h3 className="font-bold mb-2 text-red-900">Lost Payments</h3>
              <p className="text-sm text-red-700">
                Forgetting who paid the deposit, who owes the balance, and
                losing track of expense receipts.
              </p>
            </div>
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📝
              </div>
              <h3 className="font-bold mb-2 text-red-900">Messy Contracts</h3>
              <p className="text-sm text-red-700">
                Word documents that look unprofessional and take 30 minutes to
                edit for every new client.
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
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              From the first inquiry to the final invoice.
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
                    Smart Calendar
                  </h3>
                </div>
                <p className="text-sm text-gray-500 pl-9">
                  Visual schedule management with conflict detection.
                </p>
                <span className="ml-9 mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                  INCLUDED IN FREE
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
                    Financial Suite
                  </h3>
                </div>
                <p className="text-sm text-gray-500 pl-9">
                  Invoices, expense tracking, and profit reports.
                </p>
                <span className="ml-9 mt-2 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                  PRO FEATURE
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
                    Auto-Contracts
                  </h3>
                </div>
                <p className="text-sm text-gray-500 pl-9">
                  Generate legal contracts in one click.
                </p>
                <span className="ml-9 mt-2 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                  PRO FEATURE
                </span>
              </button>
            </div>

            {/* Preview Window */}
            <div className="lg:w-2/3">
              <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl border border-gray-800">
                <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden">
                  {/* Dynamic Image based on active Tab */}
                  <img
                    src={
                      activeTab === "calendar"
                        ? screenshots.calendar
                        : activeTab === "finance"
                          ? screenshots.finance
                          : screenshots.contract
                    }
                    alt="Feature Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Feature Details Text */}
              <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100">
                {activeTab === "calendar" && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold mb-3">
                      Never Double Book Again
                    </h3>
                    <p className="text-gray-600 mb-4">
                      The core of your business is the calendar. Our system
                      prevents you from booking two events at the same time. You
                      can see your schedule by Month, Week, or Day.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Drag & Drop
                        Interface
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Event
                        Status (Pending/Confirmed)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Client
                        Quick-View
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" /> Mobile
                        Friendly
                      </li>
                    </ul>
                  </div>
                )}
                {activeTab === "finance" && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold mb-3">
                      Know Your Numbers
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Stop guessing your profit. Track every dinar coming in and
                      going out. Create professional PDF invoices that impress
                      your clients.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Automated
                        PDF Invoices
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Payment
                        Tracking (Deposit/Balance)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Expense
                        Management
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Monthly
                        Profit Reports
                      </li>
                    </ul>
                  </div>
                )}
                {activeTab === "legal" && (
                  <div className="animate-in fade-in">
                    <h3 className="text-xl font-bold mb-3">
                      Legal Protection Made Easy
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Contracts protect your business, but they are a pain to
                      write. Fiesta auto-fills your standard contract with the
                      event details instantly.
                    </p>
                    <ul className="grid grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Custom
                        Contract Templates
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Auto-fill
                        Client Data
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Print
                        Ready PDFs
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500" /> Digital
                        Archives
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
        {/* Background Blob */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-50 to-gray-50 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start for free. Upgrade only when you need the power tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FREE PLAN */}
            <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all relative">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-500 mb-6">
                Perfect for getting organized.
              </p>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  Free
                </span>
                <span className="text-gray-500"> / forever</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">
                    <strong>Unlimited</strong> Events Calendar
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Client Database (CRM)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">Basic Dashboard Access</span>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <div className="p-1 bg-gray-100 rounded-full">
                    <X className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-gray-400 line-through">
                    Financial Reports
                  </span>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <div className="p-1 bg-gray-100 rounded-full">
                    <X className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-gray-400 line-through">
                    Invoices & Contracts
                  </span>
                </div>
              </div>

              <button className="w-full py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                Create Free Account
              </button>
            </div>

            {/* PRO PLAN */}
            <div className="bg-gray-900 p-8 rounded-3xl border-2 border-orange-500 shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-2xl">
                RECOMMENDED
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Pro Business
              </h3>
              <p className="text-gray-400 mb-6">
                For venues serious about growth.
              </p>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  Contact Us
                </span>
                <span className="text-gray-400 block text-sm mt-1">
                  for custom pricing
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange-600 rounded-full">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white">
                    <strong>Everything in Starter</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">
                    Advanced Financial Reports
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">
                    Invoices & Expense Tracking
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">One-Click Contracts</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-gray-700 rounded-full">
                    <Check className="w-3 h-3 text-orange-400" />
                  </div>
                  <span className="text-gray-300">Staff Task Management</span>
                </div>
              </div>

              <button className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-900/50">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">
            Common Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Is the free version really free forever?
              </h3>
              <p className="text-gray-600">
                Yes. If you only need to manage your calendar and client list,
                you will never have to pay. We hope you grow enough to need the
                Pro features later!
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use industry-standard encryption. Unlike a
                physical notebook, you can't lose your data if you lose your
                phone.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Can I export my data?
              </h3>
              <p className="text-gray-600">
                Yes, Pro users can export financial reports and client lists to
                Excel or PDF at any time.
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
                Ready to professionalize your venue?
              </h2>
              <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
                Join hundreds of Tunisian venue owners who are saving time and
                making more money with Fiesta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
                  Get Started for Free
                </button>
                <button className="bg-orange-700 text-white border border-orange-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-800 transition-colors">
                  Contact Sales
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
