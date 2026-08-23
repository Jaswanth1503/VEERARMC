"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, Plus, Search, Filter, Calendar, TrendingUp, Clock, 
  CheckCircle2, AlertTriangle, Truck, ArrowRight, ShieldCheck, 
  Layers, FileSpreadsheet, Eye, ChevronRight, RefreshCw, BarChart2
} from "lucide-react";

export default function OrdersManagementHub() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, gradeFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = "/api/orders?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      if (gradeFilter !== "ALL") url += `concreteGrade=${gradeFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  // KPIs
  const totalOrders = orders.length;
  const pendingApproval = orders.filter(o => ["SUBMITTED", "UNDER_REVIEW", "DRAFT"].includes(o.status)).length;
  const activeDeliveries = orders.filter(o => ["APPROVED", "PRODUCTION_SCHEDULED", "IN_PRODUCTION", "IN_TRANSIT", "READY_FOR_DISPATCH"].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;
  const totalVolume = orders.reduce((acc, o) => acc + (o.totalQuantity || o.quantity || 0), 0);
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || o.estimatedValue || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-full border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case "IN_TRANSIT":
      case "READY_FOR_DISPATCH":
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] rounded-full border border-blue-200 flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit</span>;
      case "PRODUCTION_SCHEDULED":
      case "IN_PRODUCTION":
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[11px] rounded-full border border-purple-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-1 bg-concrete-100 text-charcoal-black font-extrabold text-[11px] rounded-full border border-concrete-300 flex items-center gap-1">✓ Delivered</span>;
      case "REJECTED":
      case "CANCELLED":
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 font-extrabold text-[11px] rounded-full border border-red-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {status}</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold text-[11px] rounded-full border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-concrete-50 text-charcoal-black p-4 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-concrete-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-orange/10 text-accent-orange font-black text-xs rounded-lg tracking-wider">
              OPERATIONS BACKBONE
            </span>
            <span className="text-xs text-concrete-500 font-semibold">• Veera RMC 2.0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-charcoal-black mt-2 tracking-tight">
            Enterprise Order Management System
          </h1>
          <p className="text-xs md:text-sm text-concrete-600 mt-1">
            Real-time batching dispatch, quote conversions, blueprint-to-order pipelines, and AI delivery logistics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-concrete-200"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/quote"
            className="px-4 py-2.5 bg-white border border-concrete-300 text-charcoal-black hover:bg-concrete-50 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-accent-orange" /> Convert Quote
          </Link>
          <Link
            href="/blueprint-analyzer"
            className="px-4 py-2.5 bg-white border border-concrete-300 text-charcoal-black hover:bg-concrete-50 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm"
          >
            <Layers className="w-4 h-4 text-emerald-500" /> Blueprint Order
          </Link>
          <Link
            href="/orders/new"
            className="px-5 py-2.5 bg-accent-orange hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-accent-orange/20"
          >
            <Plus className="w-4 h-4" /> Create New Order
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-concrete-200 shadow-sm">
          <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Total Orders</div>
          <div className="text-2xl font-black text-charcoal-black mt-1">{totalOrders}</div>
          <div className="text-[10px] text-concrete-400 mt-1 font-semibold">Active enterprise registry</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-black text-amber-800 mt-1">{pendingApproval}</div>
          <div className="text-[10px] text-amber-600 mt-1 font-semibold">Awaiting tech approval</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Active Deliveries</div>
          <div className="text-2xl font-black text-blue-800 mt-1">{activeDeliveries}</div>
          <div className="text-[10px] text-blue-600 mt-1 font-semibold">In production / transit</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Delivered</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{deliveredOrders}</div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold">Completed pours</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-concrete-200 shadow-sm">
          <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Total Volume</div>
          <div className="text-2xl font-black text-accent-orange mt-1">{totalVolume.toFixed(1)} <span className="text-xs font-bold text-concrete-600">m³</span></div>
          <div className="text-[10px] text-concrete-400 mt-1 font-semibold">Demand batched</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-concrete-200 shadow-sm">
          <div className="text-[11px] font-bold text-concrete-500 uppercase tracking-wider">Estimated Revenue</div>
          <div className="text-xl font-black text-charcoal-black mt-1">₹{(totalRevenue / 100000).toFixed(2)} <span className="text-xs font-bold text-concrete-600">Lakh</span></div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold">Commercial value</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-concrete-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-concrete-400" />
          <input
            type="text"
            placeholder="Search by order #, address, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-medium focus:outline-none focus:border-accent-orange"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-concrete-50 p-1 rounded-xl border border-concrete-200">
            <span className="text-[11px] font-bold text-concrete-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {["ALL", "SUBMITTED", "APPROVED", "PRODUCTION_SCHEDULED", "DELIVERED"].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  statusFilter === st ? "bg-accent-orange text-white shadow-sm" : "text-concrete-600 hover:text-charcoal-black"
                }`}
              >
                {st === "PRODUCTION_SCHEDULED" ? "SCHEDULED" : st}
              </button>
            ))}
          </div>

          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="p-2 bg-concrete-50 border border-concrete-200 rounded-xl text-xs font-bold text-concrete-700 focus:outline-none"
          >
            <option value="ALL">All Grades</option>
            <option value="M20">M20 Grade</option>
            <option value="M25">M25 Grade</option>
            <option value="M30">M30 Grade</option>
            <option value="M35">M35 Grade</option>
            <option value="M40">M40 Grade</option>
            <option value="M50">M50 Grade</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-2xl border border-concrete-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-concrete-500 text-xs font-semibold flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-accent-orange" />
            Loading enterprise orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Package className="w-12 h-12 text-concrete-300 mx-auto" />
            <div className="text-sm font-black text-charcoal-black">No orders found matching filters</div>
            <p className="text-xs text-concrete-500 max-w-sm mx-auto">
              Create a new order request or adjust your status search filter.
            </p>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-orange text-white text-xs font-extrabold rounded-xl shadow-sm hover:bg-orange-600"
            >
              <Plus className="w-3.5 h-3.5" /> Place First Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-concrete-100/75 text-charcoal-black font-extrabold border-b border-concrete-200">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">Customer & Project</th>
                  <th className="p-4">Grade & Volume</th>
                  <th className="p-4">Requested Delivery</th>
                  <th className="p-4">AI Risk Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-200">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-concrete-50/75 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-charcoal-black flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-accent-orange" />
                        {o.orderNumber}
                      </div>
                      <div className="text-[10px] text-concrete-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black">{o.customer?.fullName || "Enterprise Client"}</div>
                      <div className="text-[10px] text-concrete-500 font-medium truncate max-w-xs">
                        {o.project?.projectName || o.deliveryAddress || "Direct Site Delivery"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-extrabold text-accent-orange flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-orange-50 text-accent-orange border border-orange-200 rounded font-black text-[10px]">
                          {o.concreteGrade}
                        </span>
                        <span>{o.totalQuantity || o.quantity} m³</span>
                      </div>
                      <div className="text-[10px] text-concrete-500 mt-0.5 font-semibold">
                        ₹{(o.totalAmount || o.estimatedValue || 0).toLocaleString("en-IN")}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-charcoal-black flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-concrete-400" />
                        {new Date(o.requestedDeliveryDate || o.deliveryDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-concrete-500 font-medium">
                        {o.preferredTimeWindow || "Morning Slot"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        o.aiRiskLevel === "HIGH" || o.aiRiskLevel === "CRITICAL"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : o.aiRiskLevel === "MEDIUM"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {o.aiRiskLevel || "LOW"} Risk
                      </span>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(o.status)}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-concrete-100 hover:bg-concrete-200 font-bold text-charcoal-black rounded-lg transition-all border border-concrete-300 text-xs shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-accent-orange" /> View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
