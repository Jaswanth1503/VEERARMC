"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Download, Search, ShieldCheck, ChevronRight, 
  Layers, CheckCircle2, Clock, Filter, Eye
} from "lucide-react";
import { PortalDocumentItem } from "@/lib/portal/types/portal";

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<PortalDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const url = new URL("/api/portal/documents", window.location.origin);
      if (typeFilter !== "ALL") url.searchParams.set("type", typeFilter);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.documents) setDocuments(data.documents);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter, search]);

  const handleDownload = (doc: PortalDocumentItem) => {
    setDownloadSuccess(doc.id);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/portal" className="text-xs text-gray-400 hover:text-white">Portal</Link>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-accent-orange font-medium">Document Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Compliance & Document Repository
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Download CAD drawings, verified NABL compressive cube certificates, GST tax invoices, and e-slips.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by certificate #, order, or filename..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent-orange"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { label: "All", val: "ALL" },
            { label: "NABL Certificates", val: "NABL_CERTIFICATE" },
            { label: "Delivery Slips", val: "DELIVERY_SLIP" },
            { label: "GST Invoices", val: "GST_INVOICE" },
            { label: "CAD Blueprints", val: "CAD_BLUEPRINT" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setTypeFilter(tab.val)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                typeFilter === tab.val
                  ? "bg-accent-orange text-white"
                  : "bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className="text-lg font-bold text-white mb-1">No Documents Found</h3>
          <p className="text-sm">There are no documents matching the selected category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    doc.type === "NABL_CERTIFICATE" ? "bg-emerald-500/20 text-emerald-400" :
                    doc.type === "GST_INVOICE" ? "bg-sky-500/20 text-sky-400" :
                    doc.type === "DELIVERY_SLIP" ? "bg-amber-500/20 text-amber-400" : "bg-neutral-800 text-gray-300"
                  }`}>
                    {doc.type.replace("_", " ")}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="text-sm font-bold text-white leading-snug">{doc.title}</h3>
                  <div className="text-xs text-gray-400">
                    Category: <span className="text-gray-300 font-medium">{doc.category}</span>
                  </div>
                </div>

                {doc.hash && (
                  <div className="mt-3 p-2 bg-neutral-950 rounded-lg text-[10px] font-mono text-gray-500 truncate">
                    {doc.hash}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-gray-500">{doc.fileSize} • {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                
                <button
                  onClick={() => handleDownload(doc)}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-xs transition ${
                    downloadSuccess === doc.id
                      ? "bg-emerald-500 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                  }`}
                >
                  {downloadSuccess === doc.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-accent-orange" />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
