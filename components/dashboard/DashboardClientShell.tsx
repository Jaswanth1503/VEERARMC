"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, Search, Menu, X, Home, Package, Users, Truck, 
  Settings, LogOut, FileText, BarChart3, Building,
  Briefcase, FileSpreadsheet, Headset, HardHat, CheckSquare, Clock, Sparkles, Layers, FlaskConical, Factory, Navigation
} from "lucide-react";
import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/ai/ChatWidget";

// Define the role-specific menus
const roleMenus: Record<string, any[]> = {
  'Admin': [
    { label: "Dashboard", href: "/dashboard/admin", icon: <Home className="w-5 h-5" /> },
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
    { label: "Orders Hub", href: "/orders", icon: <Package className="w-5 h-5 text-accent-orange" /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { label: "Recommendation Engine", href: "/recommendations", icon: <Truck className="w-5 h-5 text-sky-400" /> },
    { label: "Blueprint Analyzer", href: "/blueprint-analyzer", icon: <Layers className="w-5 h-5 text-emerald-400" /> },
    { label: "Quality Predictor", href: "/quality-predictor", icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
    { label: "Project Blueprints", href: "/dashboard/contractor/blueprints", icon: <FileText className="w-5 h-5" /> },
    { label: "Quote Generator", href: "/quote", icon: <FileSpreadsheet className="w-5 h-5 text-accent-orange" /> },
    { label: "Project Quotes", href: "/dashboard/contractor/quotes", icon: <FileText className="w-5 h-5" /> },
    { label: "Current Projects", href: "/dashboard/contractor/projects", icon: <Building className="w-5 h-5" /> },
    { label: "Project Orders", href: "/dashboard/contractor/orders", icon: <HardHat className="w-5 h-5" /> },
    { label: "Invoices", href: "/dashboard/contractor/invoices", icon: <FileText className="w-5 h-5" /> },
  ],
  'Employee': [
    { label: "Dashboard", href: "/dashboard/employee", icon: <Home className="w-5 h-5" /> },
    { label: "AI Assistant", href: "/ai-assistant", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { label: "Quality Predictor", href: "/quality-predictor", icon: <FlaskConical className="w-5 h-5 text-purple-400" /> },
    { label: "Attendance", href: "/dashboard/employee/attendance", icon: <Clock className="w-5 h-5" /> },
    { label: "Tasks", href: "/dashboard/employee/tasks", icon: <CheckSquare className="w-5 h-5" /> },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navItems = roleMenus[role] || [];
  
  // Add common settings link at the bottom
  const fullNavItems = [...navItems, { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> }];

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-concrete-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"} 
        transition-all duration-300 ease-in-out bg-charcoal-black text-white flex flex-col fixed md:relative z-40 h-full shadow-xl`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-concrete-800">
          <Link href={`/dashboard/${role.toLowerCase()}`} className={`font-black tracking-tighter flex items-baseline ${!sidebarOpen && 'hidden md:flex md:text-sm'}`}>
            <span className="text-[#DA291C] italic mr-1">VEERA</span>
            {sidebarOpen && <span className="text-[#008C45]">CONCRETE</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-concrete-800 rounded-md md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {fullNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive 
                    ? "bg-accent-orange text-white" 
                    : "text-concrete-300 hover:bg-concrete-800 hover:text-white"
                }`}
                title={item.label}
              >
                {item.icon}
                {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-concrete-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-concrete-300 hover:bg-error-red hover:text-white hover:bg-opacity-20 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-concrete-200 flex items-center justify-between px-4 md:px-6 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 -ml-2 rounded-md hover:bg-concrete-100 text-concrete-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center text-sm text-concrete-500 font-medium">
              <span>Dashboard</span>
              <span className="mx-2">/</span>
              <span className="text-charcoal-black capitalize">{role}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
              <input 
                type="text" 
                placeholder="Search tools, orders, AI..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/ai-assistant?query=${encodeURIComponent((e.target as HTMLInputElement).value)}`;
                  }
                }}
                className="pl-9 pr-4 py-2 bg-white/50 border border-concrete-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange w-64 transition-all shadow-sm"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  const notifEl = document.getElementById("dashboard-notif-dropdown");
                  if (notifEl) notifEl.classList.toggle("hidden");
                }}
                className="relative p-2 rounded-full hover:bg-concrete-100 text-concrete-600 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-orange rounded-full border-2 border-white"></span>
              </button>

              <div id="dashboard-notif-dropdown" className="hidden absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-concrete-200 shadow-xl p-4 z-50">
                <div className="flex items-center justify-between border-b border-concrete-100 pb-2 mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-black">System Notifications</h4>
                  <span className="text-[10px] bg-accent-orange/10 text-accent-orange font-bold px-2 py-0.5 rounded-full">Live</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 bg-concrete-50 rounded-xl border border-concrete-100">
                    <p className="font-semibold text-charcoal-black">Delivery Dispatched</p>
                    <p className="text-concrete-500 mt-0.5">Transit Mixer TM-04 is en route for Order #1042.</p>
                  </div>
                  <div className="p-2.5 bg-concrete-50 rounded-xl border border-concrete-100">
                    <p className="font-semibold text-charcoal-black">Batching Plant Operational</p>
                    <p className="text-concrete-500 mt-0.5">Central Plant 01 operating at optimal 120 m³/hr.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Link 
              href="/dashboard/settings" 
              className="h-9 w-9 rounded-full bg-steel-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer border-2 border-white ring-2 ring-concrete-100 uppercase hover:scale-105 transition-transform"
              title="View Account Settings"
            >
              {user?.fullName?.substring(0, 2) || 'U'}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-concrete-50/50">
          {children}
        </main>
        <ChatWidget />
      </div>
    </div>
  );
}
