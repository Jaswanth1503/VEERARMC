"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Moon, Sun, Globe, Menu, X, User, ArrowRight, Sparkles, FileText, Truck, Calculator, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import MagneticButton from "@/components/buttons/MagneticButton";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Products", href: "/#products" },
  { label: "Projects", href: "/#projects" },
  { label: "Services", href: "/#services" },
  { label: "AI Assistant", href: "/ai-assistant" },
  { label: "Contact", href: "/#contact" },
];

const languages = [
  { code: "EN", name: "English", flag: "🇬🇧" },
  { code: "HI", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "GU", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { code: "MR", name: "मराठी (Marathi)", flag: "🇮🇳" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSession, setUserSession] = useState<{ role?: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUserSession(data.user);
      })
      .catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Keep clean light corporate theme active without document color distortion
  };

  const handleSelectLang = (langCode: string) => {
    setCurrentLang(langCode);
    setLangOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/ai-assistant?query=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-7xl z-50 transition-all duration-300 ease-in-out rounded-full border border-pure-white/20",
          scrolled 
            ? "bg-pure-white/80 backdrop-blur-md shadow-lg h-[64px] md:h-[70px]" 
            : "bg-pure-white/30 backdrop-blur-md h-[70px] md:h-[80px]"
        )}
      >
        <div className="w-full px-4 md:px-6 xl:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl md:text-2xl font-bold tracking-tighter flex items-baseline">
              <span className="text-[#DA291C] italic font-black mr-1.5">VEERA</span>
              <span className="text-[#008C45]">CONCRETE</span>
            </Link>
          </div>

          <nav className="hidden xl:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-concrete-700 hover:text-charcoal-black transition-colors relative group"
              >
                {item.label}
                <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-accent-orange transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-4 relative">
            {/* Search Trigger */}
            <MagneticButton 
              onClick={() => setSearchOpen(true)}
              title="Search Products & Tools" 
              className="cursor-pointer p-2 rounded-full hover:bg-concrete-100 transition-colors"
            >
              <Search className="w-5 h-5 text-concrete-700" />
            </MagneticButton>

            {/* Theme Toggle Icon */}
            <MagneticButton 
              onClick={toggleDarkMode}
              title="Theme Preference"
              className="cursor-pointer p-2 rounded-full hover:bg-concrete-100 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-accent-orange" />
              ) : (
                <Moon className="w-5 h-5 text-concrete-700" />
              )}
            </MagneticButton>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <MagneticButton 
                onClick={() => setLangOpen(!langOpen)}
                title={`Select Language (${currentLang})`}
                className="cursor-pointer p-2 rounded-full hover:bg-concrete-100 transition-colors flex items-center gap-1"
              >
                <Globe className="w-5 h-5 text-concrete-700" />
                <span className="text-xs font-bold text-concrete-700 uppercase">{currentLang}</span>
              </MagneticButton>

              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-52 bg-white rounded-2xl border border-concrete-200 shadow-xl p-2 z-50"
                  >
                    <div className="text-[10px] font-bold text-concrete-400 uppercase tracking-wider px-3 py-1.5 border-b border-concrete-100 mb-1">
                      Choose Language
                    </div>
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleSelectLang(l.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                          currentLang === l.code 
                            ? "bg-accent-orange/10 text-accent-orange font-bold" 
                            : "text-charcoal-black hover:bg-concrete-100"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                        </span>
                        {currentLang === l.code && <Check className="w-3.5 h-3.5 text-accent-orange" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Link */}
            <Link href={userSession ? "/dashboard" : "/login"} title="User Profile / Login">
              <MagneticButton className="cursor-pointer p-2 rounded-full hover:bg-concrete-100 transition-colors">
                <User className="w-5 h-5 text-concrete-700" />
              </MagneticButton>
            </Link>

            {/* Get Quote CTA */}
            <Link href="/quote">
              <button className="ml-2 px-6 py-2.5 bg-charcoal-black text-pure-white rounded-full text-sm font-medium hover:bg-concrete-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
                Get Quote
              </button>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            className="xl:hidden p-2 text-charcoal-black dark:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Global Interactive Search Overlay Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-charcoal-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="bg-white dark:bg-charcoal-black rounded-3xl border border-concrete-200 dark:border-concrete-800 shadow-2xl w-full max-w-2xl p-6 space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-concrete-100 dark:border-concrete-800 pb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-accent-orange" />
                  <h3 className="font-bold text-lg text-charcoal-black dark:text-white">Search Veera RMC Platform</h3>
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg text-concrete-400 hover:text-charcoal-black dark:hover:text-white hover:bg-concrete-100 dark:hover:bg-concrete-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search concrete grades, quotes, blueprints, delivery..."
                  className="w-full pl-12 pr-24 py-4 bg-concrete-50 dark:bg-concrete-900 border border-concrete-200 dark:border-concrete-800 rounded-2xl text-base text-charcoal-black dark:text-white focus:outline-none focus:border-accent-orange shadow-inner"
                />
                <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-concrete-400" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent-orange text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="space-y-3">
                <p className="text-xs font-bold text-concrete-400 uppercase tracking-wider">Quick Platform Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/quote"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 bg-concrete-50 dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800 flex items-center justify-between text-xs font-semibold text-charcoal-black dark:text-white hover:border-accent-orange transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-accent-orange" />
                      AI Concrete Quote Generator
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-concrete-400" />
                  </Link>

                  <Link
                    href="/blueprint-analyzer"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 bg-concrete-50 dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800 flex items-center justify-between text-xs font-semibold text-charcoal-black dark:text-white hover:border-accent-orange transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Blueprint & Plan Analyzer
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-concrete-400" />
                  </Link>

                  <Link
                    href="/recommendations"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 bg-concrete-50 dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800 flex items-center justify-between text-xs font-semibold text-charcoal-black dark:text-white hover:border-accent-orange transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-sky-500" />
                      Live Truck Tracking & Dispatch
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-concrete-400" />
                  </Link>

                  <Link
                    href="/ai-assistant"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 bg-concrete-50 dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800 flex items-center justify-between text-xs font-semibold text-charcoal-black dark:text-white hover:border-accent-orange transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Ask Veera AI Engineer
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-concrete-400" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-pure-white dark:bg-charcoal-black backdrop-blur-xl flex flex-col"
          >
            <div className="p-4 md:p-8 flex justify-end">
              <button
                className="p-2 text-charcoal-black dark:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col items-center justify-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-2xl md:text-4xl font-bold tracking-tight text-charcoal-black dark:text-white hover:text-accent-orange transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-8 flex justify-center gap-6 pb-12">
              <button onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}>
                <Search className="w-6 h-6 text-charcoal-black dark:text-white cursor-pointer" />
              </button>
              <button onClick={toggleDarkMode}>
                {darkMode ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-charcoal-black dark:text-white cursor-pointer" />}
              </button>
              <button onClick={() => setLangOpen(!langOpen)}>
                <Globe className="w-6 h-6 text-charcoal-black dark:text-white cursor-pointer" />
              </button>
              <Link href={userSession ? "/dashboard" : "/login"} onClick={() => setMobileMenuOpen(false)}>
                <User className="w-6 h-6 text-charcoal-black dark:text-white cursor-pointer" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
