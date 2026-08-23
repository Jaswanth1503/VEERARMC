"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, PhoneCall } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-pure-white">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden relative shadow-2xl"
        >
          {/* Background Gradient & Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-black via-steel-blue-900 to-charcoal-black" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-orange/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-steel-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative p-10 md:p-16 lg:p-20 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-pure-white mb-6 leading-tight max-w-3xl">
              Ready to Build Something <span className="text-accent-orange">Strong?</span>
            </h2>
            <p className="text-lg md:text-xl text-concrete-300 mb-12 max-w-2xl leading-relaxed">
              Whether you need a quick quotation, a technical consultation, or want to explore our AI-powered planning tools, our team is ready to assist you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto justify-center">
              <Link href="/quote" className="px-8 py-4 bg-accent-orange text-pure-white rounded-md font-medium flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,90,0,0.3)] hover:shadow-[0_0_30px_rgba(255,90,0,0.5)] group hover:-translate-y-1">
                Get Instant Quote
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/ai-assistant" className="px-8 py-4 bg-pure-white/10 backdrop-blur-md border border-white/20 text-pure-white rounded-md font-medium flex items-center justify-center gap-2 hover:bg-pure-white/20 transition-all hover:-translate-y-1">
                <MessageSquare className="w-5 h-5" />
                Talk to AI
              </Link>
              <Link href="/#contact" className="px-8 py-4 bg-transparent border border-concrete-600 text-concrete-300 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-concrete-800 hover:text-pure-white hover:border-concrete-500 transition-all hover:-translate-y-1">
                <PhoneCall className="w-5 h-5" />
                Contact Sales
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
