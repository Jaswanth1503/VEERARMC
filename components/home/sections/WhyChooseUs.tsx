"use client";

import { motion } from "framer-motion";
import { Award, ShieldCheck, Factory, Users, Zap, BrainCircuit, Leaf, HeadphonesIcon } from "lucide-react";
import React from "react";

const reasons = [
  { icon: Award, title: "Premium Materials", desc: "Sourcing only the highest grade aggregates and cement." },
  { icon: ShieldCheck, title: "Certified Quality", desc: "ISO 9001 certified batching and delivery processes." },
  { icon: Factory, title: "Modern Plants", desc: "Fully automated, computerized batching infrastructure." },
  { icon: Users, title: "Experienced Team", desc: "Decades of engineering expertise at your disposal." },
  { icon: Zap, title: "Fast Delivery", desc: "Optimized routing ensures concrete arrives fresh and workable." },
  { icon: BrainCircuit, title: "AI Assisted Planning", desc: "Predictive logistics for zero-downtime pouring." },
  { icon: Leaf, title: "Eco Friendly Process", desc: "Water recycling and low carbon emission operations." },
  { icon: HeadphonesIcon, title: "24/7 Support", desc: "Dedicated customer service around the clock." },
];

export default function WhyChooseUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <section className="py-24 bg-charcoal-black text-pure-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-steel-blue-400 via-charcoal-black to-charcoal-black" />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          
          <div className="w-full lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="sticky top-32"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Why Industry Leaders Choose <span className="text-accent-orange">Veera RMC</span>
              </h2>
              <p className="text-concrete-400 text-lg mb-8 leading-relaxed">
                We don't just supply concrete; we partner with you to ensure structural integrity, operational efficiency, and absolute peace of mind.
              </p>
              
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-concrete-900 border border-concrete-800 hidden lg:block">
                {/* 3D Illustration Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-steel-blue-900/50 blur-3xl absolute" />
                  <ShieldCheck className="w-24 h-24 text-concrete-700" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-2/3">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
              {reasons.map((reason, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="p-6 rounded-xl bg-concrete-900/50 border border-concrete-800 hover:bg-concrete-800/80 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-charcoal-black border border-concrete-700 flex items-center justify-center mb-5">
                    {React.createElement(reason.icon, { className: "w-5 h-5 text-accent-orange" })}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
                  <p className="text-concrete-400 leading-relaxed text-sm">{reason.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
