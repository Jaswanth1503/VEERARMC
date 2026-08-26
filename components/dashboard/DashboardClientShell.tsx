"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bell, Search, Menu, X, Home, Package, Users, Truck, 
  Settings, LogOut, FileText, BarChart3, Building,
  Briefcase, FileSpreadsheet, Headset, HardHat, CheckSquare, Clock, Sparkles, Layers, FlaskConical, Factory, Navigation, TrendingUp
} from "lucide-react";
import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ai/ChatWidget";

// Define the role-specific menus
const roleMenus: Record<string, any[]> = {
  'Admin': [
    { label: "Dashboard", href: "/dashboard/admin", icon: <Home className="w-5 h-5" /> },
    { label: "AI Forecasting Hub", href: "/forecasting", icon: <TrendingUp className="w-5 h-5 text-amber-400" /> },
    { label: "Executive BI Hub", href: "/analytics", icon: <BarChart3 className="w-5 h-5 text-emerald-400" /> },
    { label: "Orders Hub", href: "/orders", icon: <Package className="w-5 h-5 text-accent-orange" /> },
    { label: "Production Hub", href: "/production", icon: <Factory className="w-5 h-5 text-emerald-400" /> },
    { label: "Logistics Hub", href: "/logistics", icon: <Navigation className="w-5 h-5 text-sky-400" /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { label: "Recommendation Engine", href: "/recommendations", icon: <Truck className="w-5 h-5 text-sky-400" /> },
    { label: "Blueprint Analyzer", href: "/blueprint-analyzer", icon: <Layers className="w-5 h-5 text-emerald-400" /> },
    { label: "Quality Predictor", href: "/quality-predictor", icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
    { label: "Blueprints", href: "/dashboard/admin/blueprints", icon: <FileText className="w-5 h-5" /> },
    { label: "Quote Generator", href: "/quote", icon: <FileSpreadsheet className="w-5 h-5 text-accent-orange" /> },
    { label: "Quotations", href: "/dashboard/admin/quotes", icon: <FileText className="w-5 h-5" /> },
    { label: "Admin Orders", href: "/dashboard/admin/orders", icon: <Package className="w-5 h-5" /> },
    { label: "Projects", href: "/dashboard/admin/projects", icon: <Building className="w-5 h-5" /> },
    { label: "Fleet", href: "/dashboard/admin/fleet", icon: <Truck className="w-5 h-5" /> },
    { label: "Users", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
    { label: "Inventory", href: "/dashboard/admin/inventory", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Reports", href: "/dashboard/admin/reports", icon: <BarChart3 className="w-5 h-5" /> },
  ],
  'Customer': [
    { label: "Dashboard", href: "/dashboard/customer", icon: <Home className="w-5 h-5" /> },
    { label: "AI Forecasting Hub", href: "/forecasting", icon: <TrendingUp className="w-5 h-5 text-amber-400" /> },
    { label: "Executive BI Hub", href: "/analytics", icon: <BarChart3 className="w-5 h-5 text-emerald-400" /> },
    { label: "Orders Hub", href: "/orders", icon: <Package className="w-5 h-5 text-accent-orange" /> },
    { label: "Live Deliveries", href: "/logistics", icon: <Navigation className="w-5 h-5 text-sky-400" /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { label: "Recommendation Engine", href: "/recommendations", icon: <Truck className="w-5 h-5 text-sky-400" /> },
    { label: "Blueprint Analyzer", href: "/blueprint-analyzer", icon: <Layers className="w-5 h-5 text-emerald-400" /> },
    { label: "Quality Predictor", href: "/quality-predictor", icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
    { label: "My Blueprints", href: "/dashboard/customer/blueprints", icon: <FileText className="w-5 h-5" /> },
    { label: "Quote Generator", href: "/quote", icon: <FileSpreadsheet className="w-5 h-5 text-accent-orange" /> },
    { label: "My Quotes", href: "/dashboard/customer/quotes", icon: <FileText className="w-5 h-5" /> },
    { label: "My Orders", href: "/dashboard/customer/orders", icon: <Package className="w-5 h-5" /> },
    { label: "Deliveries", href: "/dashboard/customer/deliveries", icon: <Truck className="w-5 h-5" /> },
    { label: "Invoices", href: "/dashboard/customer/invoices", icon: <FileText className="w-5 h-5" /> },
    { label: "Support", href: "/dashboard/customer/support", icon: <Headset className="w-5 h-5" /> },
  ],
  'Contractor': [
    { label: "Dashboard", href: "/dashboard/contractor", icon: <Home className="w-5 h-5" /> },
    { label: "AI Forecasting Hub", href: "/forecasting", icon: <TrendingUp className="w-5 h-5 text-amber-400" /> },
    { label: "Executive BI Hub", href: "/analytics", icon: <BarChart3 className="w-5 h-5 text-emerald-400" /> },
    { label: "Orders Hub", href: "/orders", icon: <Package className="w-5 h-5 text-accent-orange" /> },
    { label: "Logistics", href: "/logistics", icon: <Navigation className="w-5 h-5 text-sky-400" /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { label: "Recommendation Engine", href: "/recommendations", icon: <Truck className="w-5 h-5 text-sky-400" /> },
    { label: "Blueprint Analyzer", href: "/blueprint-analyzer", icon: <Layers className="w-5 h-5 text-emerald-400" /> },
    { label: "Quality Predictor", href: "/quality-predictor", icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
    { label: "My Projects", href: "/dashboard/contractor/projects", icon: <HardHat className="w-5 h-5" /> },
    { label: "Site Blueprints", href: "/dashboard/contractor/blueprints", icon: <FileText className="w-5 h-5" /> },
    { label: "Quote Generator", href: "/quote", icon: <FileSpreadsheet className="w-5 h-5 text-accent-orange" /> },
    { label: "Quick Order", href: "/dashboard/contractor/order", icon: <Package className="w-5 h-5" /> },
    { label: "Orders", href: "/dashboard/contractor/orders", icon: <CheckSquare className="w-5 h-5" /> },
    { label: "Invoices", href: "/dashboard/contractor/invoices", icon: <FileText className="w-5 h-5" /> },
  ],
  'Employee': [
    { label: "Dashboard", href: "/dashboard/employee", icon: <Home className="w-5 h-5" /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { label: "My Tasks", href: "/dashboard/employee/tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { label: "Attendance", href: "/dashboard/employee/attendance", icon: <Clock className="w-5 h-5" /> },
    { label: "Salary", href: "/dashboard/employee/salary", icon: <FileSpreadsheet className="w-5 h-5" /> },
  ],
  'Supplier': [
    { label: "Dashboard", href: "/dashboard/supplier", icon: <Home className="w-5 h-5" /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { label: "Purchase Requests", href: "/dashboard/supplier/requests", icon: <Package className="w-5 h-5" /> },
    { label: "Inventory", href: "/dashboard/supplier/inventory", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Payments", href: "/dashboard/supplier/payments", icon: <FileText className="w-5 h-5" /> },
  ],
};

export default function DashboardClientShell({ children, role, user }: { children: React.ReactNode, role: string, user: any }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = roleMenus[role] || roleMenus['Customer'];
  
  // Add common settings link at the bottom
  const fullNavItems = [...navItems, { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> }];

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-concrete-50 overflow-hidden relative" data-lenis-prevent="true">
      {/* Mobile Backdrop Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-charcoal-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        data-lenis-prevent="true"
        className={`${
          sidebarOpen 
            ? "w-64 translate-x-0" 
            : isMobile 
            ? "w-64 -translate-x-full" 
            : "w-20 translate-x-0"
        } 
        transition-transform duration-300 ease-in-out bg-charcoal-black text-white flex flex-col fixed md:relative z-50 h-full shadow-2xl md:shadow-xl`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-concrete-800 shrink-0">
          <Link 
            href={`/dashboard/${role.toLowerCase()}`} 
            onClick={handleNavClick}
            className="font-black tracking-tighter flex items-baseline"
          >
            <span className="text-[#DA291C] italic mr-1">VEERA</span>
            <span className="text-[#008C45]">{sidebarOpen || isMobile ? "CONCRETE" : ""}</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-2 hover:bg-concrete-800 text-concrete-300 rounded-lg md:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-concrete-800" data-lenis-prevent="true">
          {fullNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${
                  isActive 
                    ? "bg-accent-orange text-white font-bold shadow-sm" 
                    : "text-concrete-300 hover:bg-concrete-800 hover:text-white font-medium"
                }`}
                title={item.label}
              >
                <span className="shrink-0">{item.icon}</span>
                {(sidebarOpen || isMobile) && <span className="text-sm truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-concrete-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-concrete-300 hover:bg-error-red hover:text-white hover:bg-opacity-20 transition-colors w-full font-medium"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(sidebarOpen || isMobile) && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0" data-lenis-prevent="true">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-concrete-200 flex items-center justify-between px-4 md:px-6 z-30 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 -ml-2 rounded-xl hover:bg-concrete-100 text-concrete-700 transition-colors active:scale-95"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center text-xs md:text-sm text-concrete-500 font-medium truncate">
              <span>Dashboard</span>
              <span className="mx-2">/</span>
              <span className="text-charcoal-black capitalize font-bold">{role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link 
              href="/orders/new" 
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent-orange hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              + Place Order
            </Link>

            <button 
              className="p-2 rounded-xl hover:bg-concrete-100 text-concrete-600 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-accent-orange absolute top-2 right-2 ring-2 ring-white"></span>
            </button>

            <div className="h-8 w-px bg-concrete-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-charcoal-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.fullName?.charAt(0) || role?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-charcoal-black leading-tight truncate max-w-[120px]">
                  {user?.fullName || "Veera User"}
                </p>
                <p className="text-[10px] text-concrete-500 capitalize">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic Page Area */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-concrete-50 overscroll-contain"
          data-lenis-prevent="true"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global AI Floating Widget */}
      <ChatWidget />
    </div>
  );
}
