import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Calendar,
  Users,
  Sparkles,
  Check,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Smartphone,
  Zap,
  Award,
  Heart,
  TrendingUp,
  Shield,
  Target,
  Rocket,
  Crown,
  Gift,
  Monitor,
  Store,
  ExternalLink,
} from "lucide-react";

const FiestaLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleNavigation = (path) => {
    // In production, this would use React Router or Next.js navigation
    console.log(`Navigating to: ${path}`);
    alert(`This will navigate to: ${path}`);
  };

  // Animated Counter Component
  const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        },
        { threshold: 0.5 }
      );

      const element = document.getElementById("stats");
      if (element) observer.observe(element);

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (!isVisible) return;

      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        setCount(Math.floor(progress * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return (
      <span>
        {count}
        {suffix}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white text-gray-900 overflow-hidden">
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

      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo with subtle animation */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Fiesta
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("products")}
                className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105"
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation("/marketplace")}
                className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Marketplace
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-600 hover:text-orange-500 transition-all duration-300 hover:scale-105"
              >
                Contact
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
              >
                Book Demo
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden transform transition-transform duration-300 hover:scale-110"
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
          <div className="md:hidden bg-white/90 backdrop-blur-xl border-t animate-in slide-in-from-top duration-300">
            <div className="px-4 py-6 space-y-4">
              <button
                onClick={() => scrollToSection("products")}
                className="block w-full text-left text-gray-600 hover:text-orange-500 py-2 transition-all duration-300 hover:translate-x-2"
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left text-gray-600 hover:text-orange-500 py-2 transition-all duration-300 hover:translate-x-2"
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation("/marketplace")}
                className="block w-full text-left text-gray-600 hover:text-orange-500 py-2 transition-all duration-300 hover:translate-x-2 flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Marketplace
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left text-gray-600 hover:text-orange-500 py-2 transition-all duration-300 hover:translate-x-2"
              >
                Contact
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Book Demo
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-8 shadow-lg animate-in fade-in slide-in-from-top duration-700 border border-orange-100">
              <Sparkles className="w-4 h-4 text-orange-500 mr-2 animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Tunisia's Premier Event Management Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              Transform Your
              <span className="block bg-gradient-to-r from-orange-500 via-orange-600 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Event Experience
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              The complete three-sided marketplace connecting venue owners,
              event planners, and service partners. Streamline your events from
              booking to celebration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom duration-700 delay-300 mb-8">
              <button
                onClick={() => scrollToSection("contact")}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center text-lg font-medium transform hover:scale-105"
              >
                Book a Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => handleNavigation("/marketplace")}
                className="group border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-300 text-lg font-medium transform hover:scale-105 hover:shadow-lg bg-white/50 backdrop-blur-sm flex items-center gap-2"
              >
                <Store className="w-5 h-5" />
                Browse Marketplace
              </button>
            </div>

            {/* Animated Stats */}
            <div
              id="stats"
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto"
            >
              {[
                { end: 500, suffix: "+", label: "Active Venues" },
                { end: 10, suffix: "K+", label: "Events Hosted" },
                { end: 250, suffix: "+", label: "Service Partners" },
                { end: 98, suffix: "%", label: "Satisfaction Rate" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="transform transition-all duration-500 hover:scale-110 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter
                      end={stat.end === 10 ? 10 : stat.end}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-40 left-10 animate-float">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full blur-xl opacity-60" />
        </div>
        <div className="absolute bottom-40 right-10 animate-float-delayed">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full blur-xl opacity-60" />
        </div>
      </section>

      {/* Mobile App Coming Soon */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500 opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left text-white">
              {/* More Visible Coming Soon Badge */}
              <div className="inline-flex items-center px-8 py-4 bg-white rounded-full mb-8 border-4 border-orange-300 animate-in fade-in slide-in-from-left duration-700 shadow-2xl">
                <Smartphone className="w-6 h-6 text-orange-500 mr-3 animate-bounce" />
                <span className="text-lg font-black text-orange-600 uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-in fade-in slide-in-from-left duration-700 delay-100">
                Plan Your Dream Wedding
                <span className="block mt-2">On The Go</span>
              </h2>
              <p className="text-xl mb-8 leading-relaxed opacity-90 animate-in fade-in slide-in-from-left duration-700 delay-200">
                Our mobile app is launching soon! Browse venues, book services,
                and manage every detail of your perfect wedding day—all from
                your smartphone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-in fade-in slide-in-from-left duration-700 delay-300">
                <div className="group flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                  <Check className="w-5 h-5 text-white" />
                  <span>Instant venue browsing</span>
                </div>
                <div className="group flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
                  <Check className="w-5 h-5 text-white" />
                  <span>Real-time booking</span>
                </div>
              </div>
            </div>
            <div className="flex-1 animate-in fade-in slide-in-from-right duration-700 delay-200">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-3xl blur-2xl" />
                <div className="relative w-64 h-96 mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl shadow-2xl flex items-center justify-center border border-white/20 transform hover:scale-105 transition-all duration-500 hover:rotate-2">
                  <Smartphone className="w-32 h-32 text-white opacity-60 animate-pulse" />
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl animate-pulse" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse delay-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section - NEW */}
      <section
        id="products"
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Products
            </h2>
            <p className="text-xl text-gray-600">
              Powerful solutions for every need
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Web App Management System */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-white/80 backdrop-blur-sm p-10 rounded-3xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  Web App Management System
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Complete event management platform for venue owners and
                  partners. Manage bookings, track finances, coordinate teams,
                  and grow your business.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "Booking Management",
                    "Financial Reports",
                    "Team Collaboration",
                    "Client Database",
                    "Invoice Generation",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2"
                    >
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleNavigation("/products/web-app")}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg uppercase hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105"
                >
                  Learn More
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile App */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-orange-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-white/80 backdrop-blur-sm p-10 rounded-3xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  Mobile App for Booking
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Browse venues, plan events, and book services on-the-go.
                  Perfect for event planners and clients organizing their
                  special occasions.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "Venue Discovery",
                    "Instant Booking",
                    "Event Planning Tools",
                    "Service Partners",
                    "Real-time Updates",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 transform transition-all duration-300 hover:translate-x-2"
                    >
                      <Check className="w-5 h-5 text-pink-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleNavigation("/products/mobile-app")}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg uppercase hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105"
                >
                  Learn More
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Product Links */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools for every stakeholder
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Venue Owners */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  For Venue Owners
                </h3>
                <p className="text-gray-600 mb-6">
                  Maximize your venue's potential with powerful management tools
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Smart booking calendar",
                    "Financial reporting & analytics",
                    "Team management system",
                    "Automated invoicing",
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start transform transition-all duration-300 hover:translate-x-2"
                    >
                      <Check className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleNavigation("/products/web-app")}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  View Web App
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* For Event Planners */}
            <div className="group relative md:-mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500 rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500 p-8 rounded-2xl shadow-2xl text-white hover:scale-110 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border-2 border-white/30">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    For Event Planners
                  </h3>
                  <p className="mb-6 opacity-90">
                    Plan perfect events with seamless coordination
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Browse & book venues instantly",
                      "Connect with service partners",
                      "Real-time event tracking",
                      "Comprehensive event dashboard",
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start transform transition-all duration-300 hover:translate-x-2"
                      >
                        <Check className="w-5 h-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleNavigation("/products/mobile-app")}
                    className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    View Mobile App
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* For Service Partners */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-600 transition-colors duration-300">
                  For Service Partners
                </h3>
                <p className="text-gray-600 mb-6">
                  Grow your business through our marketplace
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Direct client connections",
                    "Job management dashboard",
                    "Review & rating system",
                    "Payment processing",
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start transform transition-all duration-300 hover:translate-x-2"
                    >
                      <Check className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleNavigation("/products/web-app")}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  View Web App
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative py-20 bg-gradient-to-br from-gray-50 to-orange-50 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-orange-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How Fiesta Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, streamlined, and powerful
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                num: 1,
                title: "Create Account",
                desc: "Sign up as a venue owner, event planner, or service partner",
                icon: Users,
              },
              {
                num: 2,
                title: "Set Up Profile",
                desc: "Complete your profile with services, pricing, and availability",
                icon: Award,
              },
              {
                num: 3,
                title: "Connect & Book",
                desc: "Browse, connect, and book through our marketplace",
                icon: Zap,
              },
              {
                num: 4,
                title: "Manage Events",
                desc: "Track everything from planning to completion",
                icon: Calendar,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative z-10">
                      {step.num}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Icon className="w-8 h-8 text-orange-500 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
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

          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent -translate-y-20" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by the Best
            </h2>
            <p className="text-xl text-gray-600">
              See what our clients say about us
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Ahmed",
                role: "Venue Owner",
                location: "La Marsa",
                initial: "SA",
                text: "Fiesta transformed how we manage our venue. The booking system is intuitive, and the financial reports save us hours every week.",
              },
              {
                name: "Karim Bouazizi",
                role: "Event Planner",
                location: "Tunis",
                initial: "KB",
                text: "Planning my daughter's wedding was stress-free thanks to Fiesta. Everything in one place—venue, catering, photography. Perfect!",
              },
              {
                name: "Leila Trabelsi",
                role: "Photographer",
                location: "Sousse",
                initial: "LT",
                text: "As a photographer, Fiesta connected me with 50+ events in 6 months. The platform is easy to use and payments are always on time.",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-orange-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-orange-500 text-orange-500 transform group-hover:scale-110 transition-transform duration-300"
                        style={{ transitionDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {testimonial.initial}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold group-hover:text-orange-600 transition-colors duration-300">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {testimonial.role}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Replacement - Contact for Pricing */}
      <section
        id="pricing"
        className="relative py-20 bg-gradient-to-br from-gray-50 to-orange-50 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm p-12 md:p-16 rounded-3xl shadow-2xl border-2 border-orange-200">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Phone className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Custom Pricing For You
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Every business is unique. We offer flexible pricing plans tailored
              to your specific needs. Contact our sales team to discuss the
              perfect solution for you.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
                <Shield className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">No Hidden Fees</h3>
                <p className="text-sm text-gray-600">
                  Transparent pricing structure
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Flexible Plans</h3>
                <p className="text-sm text-gray-600">Scalable to your growth</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
                <Award className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Best Value</h3>
                <p className="text-sm text-gray-600">
                  Competitive rates guaranteed
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+21612345678"
                className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center text-lg font-semibold"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Us Now
              </a>
              <button
                onClick={() => scrollToSection("contact")}
                className="group border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300 text-lg font-semibold"
              >
                Contact Sales
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
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How does the marketplace work?",
                a: "Fiesta connects three key groups: venue owners who list their spaces, clients who book venues for events, and service partners (caterers, photographers, DJs, etc.) who provide event services. Our platform facilitates seamless communication, booking, and payment processing for all parties.",
              },
              {
                q: "What event types are supported?",
                a: "Fiesta supports all event types including weddings, birthdays, corporate events, conferences, parties, and more. Our flexible system adapts to any event size or complexity.",
              },
              {
                q: "How do I get started?",
                a: "Simply contact our sales team to discuss your needs. We'll create a custom package and get you onboarded quickly with full training and support.",
              },
              {
                q: "Can I try before committing?",
                a: "Yes! We offer personalized demos where you can explore all features. Contact us to schedule your demo session.",
              },
              {
                q: "What support do you provide?",
                a: "We provide comprehensive support including onboarding training, technical assistance, and dedicated account management. Our team is committed to your success.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold mb-3 group-hover:text-orange-600 transition-colors duration-300 flex items-start">
                  <Heart className="w-5 h-5 mr-3 mt-1 text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 leading-relaxed ml-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center text-white px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join hundreds of venues, planners, and partners already using Fiesta
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Phone,
                title: "CALL US",
                value: "+216 12 345 678",
                href: "tel:+21612345678",
              },
              {
                icon: Mail,
                title: "EMAIL US",
                value: "contact@fiesta.tn",
                href: "mailto:contact@fiesta.tn",
              },
              {
                icon: MapPin,
                title: "VISIT US",
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+21612345678"
              className="group bg-white text-orange-500 px-8 py-4 rounded-lg hover:shadow-2xl transition-all duration-300 text-lg font-medium flex items-center justify-center transform hover:scale-105"
            >
              <Phone className="w-5 h-5 mr-2" />
              Book a Demo
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <button
              onClick={() => handleNavigation("/marketplace")}
              className="group border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-orange-500 transition-all duration-300 text-lg font-medium transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              Browse Marketplace
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Fiesta</span>
              </div>
              <p className="text-gray-400 text-sm">
                Tunisia's premier event management platform connecting venues,
                planners, and service partners.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button
                    onClick={() => scrollToSection("products")}
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("/marketplace")}
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Marketplace
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    About Us
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    Careers
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2025 Fiesta. All rights reserved. Made with{" "}
              <Heart className="w-4 h-4 inline text-orange-500 animate-pulse" />{" "}
              in Tunisia
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
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
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }

        .animate-in {
          animation-fill-mode: both;
        }

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

        @keyframes slide-in-from-left {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-in-from-right {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
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

        .slide-in-from-left {
          animation: slide-in-from-left 0.6s ease-out;
        }

        .slide-in-from-right {
          animation: slide-in-from-right 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FiestaLanding;
