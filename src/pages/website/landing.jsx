import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Users,
  Sparkles,
  Check,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Smartphone,
  Zap,
  Award,
  Heart,
  Shield,
  Monitor,
  Store,
  LayoutDashboard,
  Clock,
  PieChart,
  CreditCard,
  Settings,
} from "lucide-react";
import Navbar from "../../components/website/Navbar";
import Footer from "../../components/website/Footer";
import { useLanguage } from "../../context/LanguageContext";

// PLACEHOLDER IMAGES
const dashboardScreenshots = [
  "/screenshots/dashboard.png",
  "/screenshots/event.png",
  "/screenshots/finance.png",
  "/screenshots/invoice.png",
  "/screenshots/tasks.png",
  "/screenshots/contract.png",
];

const Landing = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const screenshotInterval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % dashboardScreenshots.length);
    }, 3500);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(screenshotInterval);
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigation = (path) => {
    // In production, use your router's navigation method
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white text-gray-900 overflow-hidden font-sans">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full blur-3xl transition-all duration-1000"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
          }}
        />
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full blur-3xl transition-all duration-1000"
          style={{
            right: `${mousePosition.x / 30}px`,
            bottom: `${mousePosition.y / 30}px`,
          }}
        />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-8 shadow-sm animate-in fade-in slide-in-from-top duration-700 border border-orange-200">
              <Sparkles
                className={`w-4 h-4 text-orange-600 ${isRTL ? "ml-2" : "mr-2"}`}
              />
              <span className="text-sm font-bold text-orange-700">
                The #1 Platform for Venue Owners
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              Simplify Your
              <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Venue Management
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              Streamline bookings, manage finances, and organize events with our
              comprehensive dashboard designed specifically for venue owners.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom duration-700 delay-300 mb-16">
              <button
                onClick={() => handleNavigation("/fiesta-venue")}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center text-lg font-medium transform hover:scale-105"
              >
                Discover the System
                <ArrowRight
                  className={`w-5 h-5 ${isRTL ? "mr-2" : "ml-2"} group-hover:translate-x-1 transition-transform duration-300`}
                />
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="group border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 text-lg font-medium transform hover:scale-105 hover:shadow-lg bg-white/50 backdrop-blur-sm"
              >
                Contact Sales
              </button>
            </div>

            {/* Dashboard Preview Carousel */}
            <div className="relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col">
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2 z-10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center mx-4">
                    <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 inline-block w-64 text-left border border-gray-200 shadow-sm">
                      fiesta.events/dashboard
                    </div>
                  </div>
                </div>

                <div className="relative aspect-[16/9] w-full bg-gray-50">
                  {dashboardScreenshots.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Fiesta Dashboard Preview ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
                        index === currentScreenshot
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0"
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <span className="text-gray-400 text-sm">
                      Loading Preview...
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {dashboardScreenshots.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentScreenshot(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentScreenshot
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-r from-orange-200/40 to-pink-200/40 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section / Venue System Focus */}
      <section
        id="venue-system"
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Solutions
            </h2>
            <p className="text-xl text-gray-600">
              Tools built for the future of event management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Web App Management System */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-white p-10 rounded-3xl border-2 border-orange-200 shadow-xl transition-all duration-500 transform hover:-translate-y-2 h-full">
                <div className="absolute top-6 right-6 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  AVAILABLE NOW
                </div>

                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">
                  Venue Management System
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  The powerful web-based command center for your venue. Handle
                  bookings, staff, finance, and client communications in one
                  secure place.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    t("landing.products.webApp.features.booking"),
                    t("landing.products.webApp.features.reports"),
                    t("landing.products.webApp.features.collaboration"),
                    t("landing.products.webApp.features.database"),
                    t("landing.products.webApp.features.invoicing"),
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleNavigation("/fiesta-venue")}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile App */}
            <div className="group relative opacity-90">
              <div className="relative bg-white/60 backdrop-blur-sm p-10 rounded-3xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-500 h-full flex flex-col">
                <div className="absolute top-6 right-6 bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-sm font-bold border border-gray-200">
                  COMING SOON
                </div>

                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mb-6 grayscale opacity-70">
                  <Smartphone className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-700">
                  Client Mobile App
                </h3>
                <p className="text-gray-500 mb-6 text-lg leading-relaxed">
                  A seamless experience for your clients to discover venues,
                  make reservations, and manage their event details on the go.
                </p>

                <div className="space-y-3 mb-8 flex-grow">
                  {[
                    t("landing.products.mobileApp.features.discovery"),
                    t("landing.products.mobileApp.features.booking"),
                    t("landing.products.mobileApp.features.tools"),
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 opacity-60"
                    >
                      <Check className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed border border-gray-200 flex items-center justify-center gap-2"
                  >
                    Join Waitlist
                    <Clock className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Fiesta?
            </h2>
            <p className="text-xl text-gray-600">
              Designed to solve the real challenges of venue management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-white p-8 rounded-2xl border-2 border-orange-100 hover:border-orange-300 shadow-lg transition-all duration-500 transform hover:-translate-y-2 h-full">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-orange-600">
                  Centralized Control
                </h3>
                <p className="text-gray-600 mb-6">
                  Stop juggling notebooks and spreadsheets. Get a visual
                  calendar, automated invoices, and team scheduling in one
                  dashboard.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 h-full">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <PieChart className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Financial Insights</h3>
                <p className="text-gray-600 mb-6">
                  Track revenue, expenses, and profitability per event. Generate
                  professional reports with a single click.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 h-full">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Store className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Built-in Marketplace
                </h3>
                <p className="text-gray-600 mb-6">
                  Showcase your venue to thousands of potential clients. Receive
                  inquiries directly into your management system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-6">
                FEATURE SPOTLIGHT
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                The Operating System for <br />
                Modern Venues
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Fiesta isn't just a calendar. It's a complete business suite
                designed to help you scale. Manage your entire venue from a
                single screen, accessible from anywhere.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <LayoutDashboard className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Centralized Command
                    </h3>
                    <p className="text-gray-400">
                      View bookings, pending inquiries, and daily schedules at a
                      glance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Financial Management
                    </h3>
                    <p className="text-gray-400">
                      Track deposits, payments, and generate automated invoices
                      effortlessly.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      Custom Configurations
                    </h3>
                    <p className="text-gray-400">
                      Set dynamic pricing, manage multiple spaces, and define
                      staff roles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-orange-600 blur-3xl opacity-20 rounded-full"></div>
              <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 hover:transform hover:scale-[1.02] transition-transform duration-500">
                <Monitor className="w-16 h-16 text-white mb-8" />
                <h3 className="text-2xl font-bold mb-4">
                  Web Management Portal
                </h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-500" /> Real-time
                    Availability Calendar
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-500" /> Client CRM
                    Database
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-500" /> Revenue
                    Analytics & Reports
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-green-500" /> Staff
                    Scheduling Tools
                  </li>
                </ul>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Request Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative py-20 bg-white px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-xl text-gray-600">
              Get your venue up and running in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                num: 1,
                title: t("landing.howItWorks.steps.createAccount.title"),
                desc: t("landing.howItWorks.steps.createAccount.description"),
                icon: Users,
              },
              {
                num: 2,
                title: t("landing.howItWorks.steps.setupProfile.title"),
                desc: t("landing.howItWorks.steps.setupProfile.description"),
                icon: Award,
              },
              {
                num: 3,
                title: "Configure Calendar",
                desc: "Set your availability and pricing rules.",
                icon: Calendar,
              },
              {
                num: 4,
                title: "Start Managing",
                desc: "Receive bookings and manage events efficiently.",
                icon: Zap,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 relative z-10">
                      {step.num}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Icon className="w-8 h-8 text-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing / Contact Info */}
      <section
        id="pricing"
        className="relative py-20 bg-gradient-to-br from-gray-50 to-orange-50 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-12 md:p-16 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Phone className="w-10 h-10 text-orange-600" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get Custom Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              {t("landing.pricing.description")}
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-6 bg-gray-50 rounded-2xl">
                <Shield className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">
                  {t("landing.pricing.noHiddenFees")}
                </h3>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">
                  {t("landing.pricing.flexiblePlans")}
                </h3>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl">
                <Award className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">
                  {t("landing.pricing.bestValue")}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+21612345678"
                className="group bg-orange-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center text-lg font-semibold"
              >
                <Phone className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("landing.pricing.callUs")}
              </a>
              <button
                onClick={() => scrollToSection("contact")}
                className="group border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-xl hover:bg-orange-50 transition-all duration-300 text-lg font-semibold"
              >
                {t("landing.pricing.contactSales")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t("landing.faq.title")}
            </h2>
            <p className="text-xl text-gray-600">{t("landing.faq.subtitle")}</p>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Is the Web Management System available now?",
                a: "Yes! The Venue Management System is live and ready to help you manage your business.",
              },
              {
                q: "When will the Mobile App be released?",
                a: "We are currently in the final stages of development. Join our waitlist to be notified when it launches.",
              },
              {
                q: t("landing.faq.questions.getStarted.q"),
                a: t("landing.faq.questions.getStarted.a"),
              },
              {
                q: t("landing.faq.questions.support.q"),
                a: t("landing.faq.questions.support.a"),
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-3 flex items-start">
                  <Heart
                    className={`w-5 h-5 ${isRTL ? "ml-3" : "mr-3"} mt-1 text-orange-500 flex-shrink-0`}
                  />
                  {faq.q}
                </h3>
                <p
                  className={`text-gray-600 leading-relaxed ${isRTL ? "mr-8" : "ml-8"}`}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500" />

        <div className="relative max-w-4xl mx-auto text-center text-white px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Optimize Your Venue?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Contact our team today to learn how Fiesta can transform your
            business.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Phone,
                title: t("landing.contact.callUs"),
                value: "+216 29 130 770",
                href: "tel:+21629130770",
              },
              {
                icon: Mail,
                title: t("landing.contact.emailUs"),
                value: "contact@fiesta.events",
                href: "mailto:contact@fiesta.events",
              },
              {
                icon: MapPin,
                title: t("landing.contact.visitUs"),
                value: "Tunis, Tunisia",
                href: "#",
              },
            ].map((contact, idx) => {
              const Icon = contact.icon;
              return (
                <a
                  key={idx}
                  href={contact.href}
                  className="group bg-white/10 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/20 transition-all duration-500 flex flex-col items-center border border-white/20 transform hover:scale-105 hover:-translate-y-2"
                >
                  <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="font-bold mb-1">{contact.title}</div>
                  <div className="text-sm opacity-90">{contact.value}</div>
                </a>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => handleNavigation("/marketplace")}
              className="group border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300 text-lg font-medium transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              Visit Marketplace
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        /* Animations preserved from previous file */
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-in-from-top {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-bottom {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .slide-in-from-top {
          animation: slide-in-from-top 0.6s ease-out;
        }
        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.6s ease-out;
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default Landing;
