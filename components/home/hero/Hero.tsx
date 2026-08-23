"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

// Removed HeroScene to use the static background image
// const HeroScene = dynamic(() => import("./HeroScene"), ...);

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden bg-gradient-to-b from-concrete-50 to-pure-white pt-20">
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 mix-blend-multiply" 
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-pure-white/70" />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 h-full relative z-10 flex flex-col justify-center pointer-events-none">
        <div className="max-w-3xl pointer-events-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-charcoal-black mb-6 leading-tight"
          >
            Building Tomorrow.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-steel-blue-600 to-accent-orange">
              Delivering Strength Today.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-charcoal-black/90 font-medium mb-10 max-w-2xl leading-relaxed"
          >
            Veera RMC delivers high-quality ready mix concrete with AI-assisted planning, faster delivery, reliable logistics, and enterprise-grade quality assurance.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/quote" className="px-8 py-4 bg-charcoal-black text-pure-white rounded-md font-medium flex items-center justify-center gap-2 hover:bg-concrete-900 transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.6)] group">
              Get Instant Quote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/#projects" 
              onClick={(e) => {
                const el = document.getElementById('projects');
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-8 py-4 bg-pure-white/80 backdrop-blur-md border border-concrete-200 text-charcoal-black rounded-md font-medium flex items-center justify-center gap-2 hover:bg-pure-white transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              Explore Projects
            </Link>
            <Link href="/ai-assistant" className="px-8 py-4 bg-transparent text-steel-blue-600 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-steel-blue-50 transition-all group">
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform text-accent-orange" />
              Talk to AI Engineer
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-wrap gap-8 md:gap-12"
          >
            <div>
              <p className="text-3xl font-bold text-charcoal-black">25+</p>
              <p className="text-sm text-concrete-700 font-bold uppercase tracking-wider mt-1">Years Exp</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-charcoal-black">1.2k</p>
              <p className="text-sm text-concrete-700 font-bold uppercase tracking-wider mt-1">Projects</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-charcoal-black">99%</p>
              <p className="text-sm text-concrete-700 font-bold uppercase tracking-wider mt-1">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-charcoal-black">500+</p>
              <p className="text-sm text-concrete-700 font-bold uppercase tracking-wider mt-1">Daily Deliveries</p>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-xs font-medium text-concrete-600 mb-2 uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 border-2 border-concrete-400 rounded-full flex justify-center p-1">
          <motion.div 
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-accent-orange rounded-full"
          />
        </div>
      </div>
    </section>
  );
}
