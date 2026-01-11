import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search,  Calendar, Users, Briefcase, FileText, DollarSign, CheckSquare, Bell, Box, Command, Camera } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../../context/LanguageContext";
import SearchResultItem from "./components/SearchResultItem";
import OrbitLoader from "../../common/LoadingSpinner";
import {
  eventService, clientService, partnerService, invoiceService,
  paymentService, taskService, reminderService, supplyService, portfolioService
} from "../../../api/index";

// Config (Keep your existing config)
const CATEGORY_CONFIG = {
  events: { icon: Calendar, color: "blue", labelKey: "common.events" },
  clients: { icon: Users, color: "green", labelKey: "common.clients" },
  partners: { icon: Briefcase, color: "purple", labelKey: "common.partners" },
  invoices: { icon: FileText, color: "orange", labelKey: "common.invoices" },
  payments: { icon: DollarSign, color: "emerald", labelKey: "common.payments" },
  tasks: { icon: CheckSquare, color: "indigo", labelKey: "common.tasks" },
  reminders: { icon: Bell, color: "yellow", labelKey: "common.reminders" },
  supplies: { icon: Box, color: "red", labelKey: "common.supplies" },
  Portfolio: { icon: Camera, color: "indigo", labelKey: "common.Portfolio" },
};

// --- Logic Hook (No changes needed here) ---
const useSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults({});
        setShow(false);
        return;
      }

      setLoading(true);
      setShow(true);

      try {
        const fetchOptions = { search: query, limit: 3, signal };
        
        const [events, clients, partners, invoices, payments, tasks, reminders, supplies] = await Promise.allSettled([
          eventService.getAll(fetchOptions),
          clientService.getAll(fetchOptions),
          partnerService.getAll(fetchOptions),
          invoiceService.getAll(fetchOptions),
          paymentService.getAll(fetchOptions),
          taskService.getAll(fetchOptions),
          reminderService.getAll(fetchOptions),
          supplyService.getAll(fetchOptions),
          portfolioService.getAll(fetchOptions),
        ]);

        if (signal.aborted) return;

        const extract = (res) => {
          if (res.status !== "fulfilled") return [];
          const val = res.value;
          if (val?.data?.data) return val.data.data;
          if (val?.data) return Array.isArray(val.data) ? val.data : [];
          const keys = ["events", "clients", "partners", "invoices", "payments", "tasks", "reminders", "supplies"];
          for (const k of keys) {
            if (val[k]) return val[k];
            if (val.data && val.data[k]) return val.data[k];
          }
          return [];
        };

        const filter = (items, type) => {
          if (!items) return [];
          const q = query.toLowerCase();
          return items.filter((i) => {
            if (type === "invoices") return i.invoiceNumber?.toLowerCase().includes(q) || i.recipientName?.toLowerCase().includes(q);
            if (type === "payments") return i.reference?.toLowerCase().includes(q);
            const text = i.title || i.name || i.company || "";
            return text.toLowerCase().includes(q);
          }).slice(0, 3);
        };

        setResults({
          events: filter(extract(events), "events"),
          clients: filter(extract(clients), "clients"),
          partners: filter(extract(partners), "partners"),
          invoices: filter(extract(invoices), "invoices"),
          payments: filter(extract(payments), "payments"),
          tasks: filter(extract(tasks), "tasks"),
          reminders: filter(extract(reminders), "reminders"),
          supplies: filter(extract(supplies), "supplies"),
          portfolio: filter(extract(portfolio), "portfolio"),
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { query, setQuery, results, loading, show, setShow };
};

// --- Component ---
const SearchBar = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  const { query, setQuery, results, loading, show, setShow } = useSearch();

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setShow]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShow(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setShow]);

  const handleResultClick = (type, id) => {
    setShow(false);
    setQuery("");
    const routes = {
      events: `/events/${id}/detail`,
      clients: `/clients/${id}`,
      partners: `/partners/${id}`,
      invoices: `/invoices/${id}/edit`,
      payments: `/payments/${id}`,
      tasks: `/tasks/${id}`,
      reminders: `/reminders/${id}`,
      supplies: `/supplies/${id}`,
      portfolio: `/portfolio/${id}`,
    };
    navigate(routes[type] || "/");
  };

  return (
    <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={containerRef}>
      <div className="relative w-full group">
        <div className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 pointer-events-none`}>
          {loading ? (
            <OrbitLoader size="maghir mtodhher enty"/>
          ) : (
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          )}
        </div>
        
        <motion.input
          ref={inputRef}
          type="text"
          placeholder={t("common.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShow(true)}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all ${isRTL ? "pr-10 pl-12 text-right" : "pl-10 pr-12 text-left"}`}
        />
        
        <div className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-500 flex items-center gap-1`}>
          <Command className="w-3 h-3" />K
        </div>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto custom-scrollbar"
          >
            {/*  FIX: Inner AnimatePresence with mode='wait' forces content to exit before new content enters */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center text-gray-500 text-sm gap-2"
                >
                  <OrbitLoader size="sm" />
                  <span>{t("common.loading")}</span>
                </motion.div>
              ) : Object.keys(results).every((k) => !results[k]?.length) ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-8 text-center"
                >
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t("common.noResults")}</p>
                </motion.div>
              ) : (
                /*  FIX: Explicit variants on the RESULTS wrapper ensure items animate even if parent is already open */
                <motion.div 
                  key="results"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { 
                      opacity: 1,
                      transition: { staggerChildren: 0.05 } 
                    }
                  }}
                  className="py-2"
                >
                  {Object.entries(results).map(([cat, items]) => {
                    if (!items || items.length === 0) return null;
                    const conf = CATEGORY_CONFIG[cat];
                    return (
                      <motion.div 
                        key={cat} 
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase flex items-center gap-2 bg-gray-50 dark:bg-gray-900/30">
                          <conf.icon className="w-3 h-3" /> {t(conf.labelKey)}
                        </div>
                        {items.map((item) => (
                          <SearchResultItem 
                            key={item._id} 
                            item={item} 
                            onClick={() => handleResultClick(cat, item._id)} 
                            config={conf} 
                          />
                        ))}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;