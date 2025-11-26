import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion"; // ✅ Import Animation Library

// 1. Custom Illustration Component (Kept clean)
const Illustration = ({ type, colorClass }) => {
    switch (type) {
        case "events": 
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
        case "clients": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <circle cx="12" cy="8" r="4" className="fill-current opacity-20" />
                    <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case "partners": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" className="fill-current opacity-20" />
                    <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" />
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case "tasks": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="4" y="4" width="16" height="18" rx="2" className="fill-current opacity-20" />
                    <rect x="4" y="4" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 4V2H15V4" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case "contracts": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" className="fill-current opacity-20" />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" />
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 18H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 14H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        case "invoices": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="4" y="2" width="16" height="20" rx="1" className="fill-current opacity-20" />
                    <rect x="4" y="2" width="16" height="20" rx="1" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        case "payments": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="2" y="5" width="20" height="14" rx="2" className="fill-current opacity-20" />
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
                    <rect x="6" y="14" width="8" height="2" className="fill-current" />
                </svg>
            );
        case "reminders": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" className="fill-current opacity-20" />
                    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case "dashboard": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <rect x="4" y="4" width="16" height="16" rx="2" className="fill-current opacity-10" />
                    <path d="M12 20V10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M18 20V4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M6 20V16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            );
        case "documents": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" className="fill-current opacity-20" />
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 3V21" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
                    <rect x="13" y="13" width="4" height="4" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case "settings": 
            return (
                <svg viewBox="0 0 24 24" fill="none" className={`w-16 h-16 ${colorClass}`}>
                    <circle cx="12" cy="12" r="5" className="fill-current opacity-20" />
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 2V5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M12 19V22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M22 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M5 12H2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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

    // 2. Animation Variants
    // The Container triggers the children to animate one by one (stagger)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Delay between each card popping up
                delayChildren: 0.2
            }
        }
    };

    // The individual Item animation
    const itemVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 10 }
        }
    };

    const modules = [
        {
            title: t("common.events", "Events"),
            id: "events",
            path: "/events",
            color: "text-blue-600 dark:text-blue-400",
            bgHover: "hover:border-blue-500 hover:shadow-blue-500/20",
            description: t("home.eventsDesc", "Calendar Management")
        },
        {
            title: t("common.clients", "Clients"),
            id: "clients",
            path: "/clients",
            color: "text-emerald-600 dark:text-emerald-400",
            bgHover: "hover:border-emerald-500 hover:shadow-emerald-500/20",
            description: t("home.clientsDesc", "Customer Database")
        },
        {
            title: t("common.partners", "Partners"),
            id: "partners",
            path: "/partners",
            color: "text-purple-600 dark:text-purple-400",
            bgHover: "hover:border-purple-500 hover:shadow-purple-500/20",
            description: t("home.partnersDesc", "Vendor Relationships")
        },
        {
            title: t("common.tasks", "Tasks"),
            id: "tasks",
            path: "/tasks",
            color: "text-teal-600 dark:text-teal-400",
            bgHover: "hover:border-teal-500 hover:shadow-teal-500/20",
            description: t("home.tasksDesc", "To-Do Lists")
        },
        {
            title: t("common.contracts", "Contracts"),
            id: "contracts",
            path: "/contracts",
            color: "text-indigo-600 dark:text-indigo-400",
            bgHover: "hover:border-indigo-500 hover:shadow-indigo-500/20",
            description: t("home.contractsDesc", "Legal Agreements")
        },
        {
            title: t("common.invoices", "Invoices"),
            id: "invoices",
            path: "/invoices",
            color: "text-orange-600 dark:text-orange-400",
            bgHover: "hover:border-orange-500 hover:shadow-orange-500/20",
            description: t("home.invoicesDesc", "Billing & Charges")
        },
        {
            title: t("common.payments", "Payments"),
            id: "payments",
            path: "/payments",
            color: "text-green-600 dark:text-green-400",
            bgHover: "hover:border-green-500 hover:shadow-green-500/20",
            description: t("home.paymentsDesc", "Income Tracking")
        },
        {
            title: t("common.reminders", "Reminders"),
            id: "reminders",
            path: "/reminders",
            color: "text-yellow-600 dark:text-yellow-400",
            bgHover: "hover:border-yellow-500 hover:shadow-yellow-500/20",
            description: t("home.remindersDesc", "Alerts & Notifications")
        },
        {
            title: t("common.documents", "Documents"),
            id: "documents",
            path: "/documents",
            color: "text-cyan-600 dark:text-cyan-400",
            bgHover: "hover:border-cyan-500 hover:shadow-cyan-500/20",
            description: t("home.docSettingsDesc", "Template Layouts")
        },
        {
            title: t("common.dashboard", "Dashboard"),
            id: "dashboard",
            path: "/dashboard",
            color: "text-rose-600 dark:text-rose-400",
            bgHover: "hover:border-rose-500 hover:shadow-rose-500/20",
            description: t("home.statsDesc", "Reports & Analytics")
        },
        {
            title: t("common.settings", "Settings"),
            id: "settings",
            path: "/settings",
            color: "text-gray-600 dark:text-gray-400",
            bgHover: "hover:border-gray-500 hover:shadow-gray-500/20",
            description: t("home.settingsDesc", "System Configuration")
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            >
                {modules.map((module, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                    >
                        <Link
                            to={module.path}
                            className={`
                              group flex flex-col items-center justify-center 
                              bg-white dark:bg-gray-800 
                              p-6 md:p-8 rounded-2xl 
                              border-2 border-gray-100 dark:border-gray-700 
                              shadow-sm 
                              transition-all duration-300
                              ${module.bgHover}
                              hover:shadow-xl
                            `}
                        >
                            {/* Animated Icon Wrapper: Rotates and scales on Hover */}
                            <motion.div 
                                className="mb-6"
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Illustration type={module.id} colorClass={module.color} />
                            </motion.div>

                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center group-hover:scale-105 transition-transform duration-200">
                                {module.title}
                            </h3>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium text-center">
                                {module.description}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Home;