import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 1. Custom Illustration Component
// These are drawn with simple shapes to look like physical objects
const Illustration = ({ type, colorClass }) => {
    switch (type) {
        case "events": // A Calendar Page
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" className="fill-current opacity-20" />
                    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                    <rect x="7" y="14" width="2" height="2" className="fill-current" />
                    <rect x="11" y="14" width="2" height="2" className="fill-current" />
                    <rect x="15" y="14" width="2" height="2" className="fill-current" />
                </svg>
            );
        case "clients": // User ID Card
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <circle cx="12" cy="8" r="4" className="fill-current opacity-20" />
                    <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case "partners": // Handshake / Briefcase
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" className="fill-current opacity-20" />
                    <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" />
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case "tasks": // Clipboard with check
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="4" y="4" width="16" height="18" rx="2" className="fill-current opacity-20" />
                    <rect x="4" y="4" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 4V2H15V4" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case "contracts": // Document with Pen
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" className="fill-current opacity-20" />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 18H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 14H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        case "invoices": // Bill / Paper with Dollar
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="4" y="2" width="16" height="20" rx="1" className="fill-current opacity-20" />
                    <rect x="4" y="2" width="16" height="20" rx="1" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        case "payments": // Credit Card
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="2" y="5" width="20" height="14" rx="2" className="fill-current opacity-20" />
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
                    <rect x="6" y="14" width="8" height="2" className="fill-current" />
                </svg>
            );
        case "reminders": // Ringing Bell
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" className="fill-current opacity-20" />
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "dashboard": // Bar Chart
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="4" y="4" width="16" height="16" rx="2" className="fill-current opacity-10" />
                    <path d="M12 20V10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M18 20V4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M6 20V16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            );
        case "settings": // Gear
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    {/* Filled center for visual weight */}
                    <circle cx="12" cy="12" r="5" className="fill-current opacity-20" />

                    {/* Central Hub Ring */}
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />

                    {/* 8 Thick, Solid Spokes (Chunky aesthetic) */}
                    <path d="M12 2V5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M12 19V22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M22 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M5 12H2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

                    {/* Diagonal Spokes */}
                    <path d="M19.07 4.93L17 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M7 17L4.93 19.07" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M19.07 19.07L17 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M7 7L4.93 4.93" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            );
        default:
            return null;
    }
};

const Home = () => {
    const { t } = useTranslation();

    // 2. Button Configuration
    const modules = [
        {
            title: t("common.events", "Events"),
            id: "events",
            path: "/events",
            color: "text-blue-600 dark:text-blue-400",
            bgHover: "hover:border-blue-500 hover:shadow-blue-100",
            description: t("home.eventsDesc", "Calendar")
        },
        {
            title: t("common.clients", "Clients"),
            id: "clients",
            path: "/clients",
            color: "text-emerald-600 dark:text-emerald-400",
            bgHover: "hover:border-emerald-500 hover:shadow-emerald-100",
            description: t("home.clientsDesc", "Customers")
        },
        {
            title: t("common.contracts", "Contracts"), // NEW BUTTON
            id: "contracts",
            path: "/contracts",
            color: "text-indigo-600 dark:text-indigo-400",
            bgHover: "hover:border-indigo-500 hover:shadow-indigo-100",
            description: t("home.contractsDesc", "Agreements")
        },
        {
            title: t("common.invoices", "Invoices"),
            id: "invoices",
            path: "/invoices",
            color: "text-orange-600 dark:text-orange-400",
            bgHover: "hover:border-orange-500 hover:shadow-orange-100",
            description: t("home.invoicesDesc", "Bills")
        },
        {
            title: t("common.payments", "Payments"),
            id: "payments",
            path: "/payments",
            color: "text-green-600 dark:text-green-400",
            bgHover: "hover:border-green-500 hover:shadow-green-100",
            description: t("home.paymentsDesc", "Money In")
        },
        {
            title: t("common.partners", "Partners"),
            id: "partners",
            path: "/partners",
            color: "text-purple-600 dark:text-purple-400",
            bgHover: "hover:border-purple-500 hover:shadow-purple-100",
            description: t("home.partnersDesc", "Vendors")
        },
        {
            title: t("common.tasks", "Tasks"),
            id: "tasks",
            path: "/tasks",
            color: "text-teal-600 dark:text-teal-400",
            bgHover: "hover:border-teal-500 hover:shadow-teal-100",
            description: t("home.tasksDesc", "To-Do")
        },
        {
            title: t("common.reminders", "Reminders"),
            id: "reminders",
            path: "/reminders",
            color: "text-yellow-600 dark:text-yellow-400",
            bgHover: "hover:border-yellow-500 hover:shadow-yellow-100",
            description: t("home.remindersDesc", "Alerts")
        },
        {
            title: t("common.dashboard", "dashboard"),
            id: "dashboard",
            path: "/dashboard",
            color: "text-rose-600 dark:text-rose-400",
            bgHover: "hover:border-rose-500 hover:shadow-rose-100",
            description: t("home.statsDesc", "Reports")
        },
        {
            title: t("common.settings", "Settings"),
            id: "settings",
            path: "/settings",
            color: "text-gray-600 dark:text-gray-400",
            bgHover: "hover:border-gray-500 hover:shadow-gray-100",
            description: t("home.settingsDesc", "Config")
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
            {/* The Big Button Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {modules.map((module, index) => (
                    <Link
                        key={index}
                        to={module.path}
                        className={`
              group flex flex-col items-center justify-center 
              bg-white dark:bg-gray-800 
              p-6 md:p-8 rounded-2xl 
              border-2 border-gray-100 dark:border-gray-700 
              shadow-sm hover:shadow-xl 
              transition-all duration-300 transform hover:-translate-y-1
              ${module.bgHover}
            `}
                    >
                        {/* The Big Illustration */}
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                            <Illustration type={module.id} colorClass={module.color} />
                        </div>

                        {/* The Large Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {module.title}
                        </h3>

                        {/* The Simple Description */}
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
                            {module.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;