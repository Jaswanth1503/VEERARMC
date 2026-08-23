"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";

const news = [
  {
    category: "Technology",
    date: "Jun 15, 2026",
    time: "5 min read",
    title: "How AI is Revolutionizing Concrete Mix Designs",
    desc: "Discover how machine learning algorithms are optimizing cement ratios for higher strength and lower carbon footprints.",
  },
  {
    category: "Projects",
    date: "Jun 02, 2026",
    time: "3 min read",
    title: "Successfully Completed 100K cu.m Pour for Eastern Metro",
    desc: "A case study on managing continuous 48-hour pouring operations in high-traffic urban environments.",
  },
  {
    category: "Sustainability",
    date: "May 20, 2026",
    time: "4 min read",
    title: "Introducing EcoMix: Our Low Carbon Concrete Range",
    desc: "We are proud to launch a new product line that reduces CO2 emissions by up to 40% without compromising strength.",
  },
];

export default function News() {
  return (
    <section className="py-24 bg-pure-white" id="news">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal-black mb-4">Latest Updates</h2>
            <p className="text-lg text-concrete-600">Insights, news, and innovations from Veera RMC.</p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:flex px-6 py-3 border border-concrete-300 rounded-md text-charcoal-black font-medium hover:bg-concrete-50 transition-colors whitespace-nowrap"
          >
            View All News
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group cursor-pointer flex flex-col h-full border border-concrete-100 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow bg-pure-white"
            >
              <div className="aspect-[16/10] bg-concrete-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-steel-blue-900 to-concrete-400 opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-pure-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-charcoal-black shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs font-medium text-concrete-500 mb-4">
                  <span>{item.date}</span>
                  <span className="w-1 h-1 rounded-full bg-concrete-300" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-charcoal-black mb-3 group-hover:text-steel-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-concrete-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                  {item.desc}
                </p>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-accent-orange mt-auto">
                  Read More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 flex justify-center md:hidden">
          <button className="px-6 py-3 border border-concrete-300 rounded-md text-charcoal-black font-medium hover:bg-concrete-50 transition-colors">
            View All News
          </button>
        </div>
      </div>
    </section>
  );
}
