"use client";

import { ArrowRight, MessageSquare, ShieldCheck, Truck, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-b from-concrete-50 via-white to-pure-white pt-28 pb-16">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 mix-blend-multiply" 
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white" />
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10 my-auto">
        <div className="max-w-3xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange text-xs font-bold tracking-wide">
            <Zap className="w-3.5 h-3.5" /> Next-Gen AI Ready Mix Concrete Management
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-charcoal-black leading-[1.1]"
          >
            Building Tomorrow.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA291C] via-accent-orange to-[#008C45]">
              Delivering Strength Today.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-concrete-700 font-medium max-w-2xl leading-relaxed"
          >
            Veera RMC delivers high-precision IS 456 / IS 10262 certified ready mix concrete with AI-assisted batching, real-time fleet telemetry, instant quotes, and executive intelligence.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2"
          >
            <Link 
              href="/quote" 
              className="px-7 py-3.5 bg-charcoal-black hover:bg-black text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5 transition-all group"
            >
              Get Instant Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-accent-orange" />
            </Link>

            <Link 
              href="/analytics" 
              className="px-6 py-3.5 bg-white border-2 border-concrete-200 hover:border-charcoal-black text-charcoal-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              Executive BI Hub
            </Link>

            <Link 
              href="/ai-assistant" 
              className="px-6 py-3.5 bg-concrete-100 hover:bg-concrete-200 text-charcoal-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-accent-orange" />
              Talk to AI Engineer
            </Link>
          </motion.div>
          
          {/* Key Metrics Strip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-concrete-200/80"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-black text-charcoal-black">25+</p>
              <p className="text-xs text-concrete-500 font-extrabold uppercase tracking-wider mt-0.5">Years Exp</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-charcoal-black">1.2k+</p>
              <p className="text-xs text-concrete-500 font-extrabold uppercase tracking-wider mt-0.5">Projects</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">99.4%</p>
              <p className="text-xs text-concrete-500 font-extrabold uppercase tracking-wider mt-0.5">On-Time Delivery</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-accent-orange">500+</p>
              <p className="text-xs text-concrete-500 font-extrabold uppercase tracking-wider mt-0.5">Daily m³ Batched</p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-black text-concrete-400 uppercase tracking-widest mb-1">Scroll Down</span>
        <div className="w-5 h-8 border-2 border-concrete-300 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-accent-orange rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
