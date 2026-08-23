"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/animations/AnimatedCounter";

const stats = [
  { value: 1200, label: "Projects Completed", suffix: "+" },
  { value: 5000000, label: "Concrete Delivered (cu.m)", suffix: "+" },
  { value: 850, label: "Clients Served", suffix: "+" },
  { value: 25, label: "Years of Experience", suffix: "+" },
  { value: 500, label: "Daily Deliveries", suffix: "+" },
  { value: 1500, label: "Employee Strength", suffix: "+" },
];

export default function Statistics() {
  return (
    <section className="py-24 bg-concrete-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-pure-white/50" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-charcoal-black mb-4"
          >
            Numbers That Speak
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-concrete-600"
          >
            Our scale and experience define our capability to handle the most demanding projects.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center flex flex-col items-center justify-center p-6 bg-pure-white rounded-2xl shadow-sm border border-concrete-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-accent-orange mb-3 tracking-tighter">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-sm md:text-base font-semibold text-concrete-600 uppercase tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
