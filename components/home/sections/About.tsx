"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";

const highlights = [
  "ISO Certified",
  "Premium Quality",
  "Experienced Engineers",
  "Advanced Machinery",
  "Timely Delivery",
  "Sustainable Practices"
];

export default function About() {
  return (
    <section className="py-24 md:py-32 bg-concrete-50 overflow-hidden" id="about">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-sm font-semibold text-accent-orange tracking-widest uppercase mb-3">About Veera</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-charcoal-black mb-6 leading-tight">
                Engineering Strength. <br/>Delivering Trust.
              </h3>
              <p className="text-lg text-concrete-600 mb-8 leading-relaxed">
                We combine decades of engineering expertise with cutting-edge AI technology to deliver the highest quality ready mix concrete. From modern batching plants to timely delivery, your project's foundation is our primary responsibility.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {highlights.map((highlight, idx) => (
                  <motion.div 
                    key={highlight}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success-green flex-shrink-0" />
                    <span className="font-medium text-concrete-800">{highlight}</span>
                  </motion.div>
                ))}
              </div>

              <button className="px-8 py-4 bg-charcoal-black text-pure-white rounded-md font-medium flex items-center gap-2 hover:bg-concrete-900 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group">
                Learn More About Us
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl"
            >
              <div className="absolute inset-0 bg-steel-blue-900/20 mix-blend-overlay z-10" />
              {/* Fallback placeholder until actual images are available */}
              <div className="w-full h-full bg-concrete-300 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-concrete-800 to-concrete-400 opacity-50" />
                <span className="relative z-20 text-concrete-600 font-medium tracking-widest uppercase">Premium Facility Presentation</span>
              </div>
            </motion.div>

            {/* Floating Stat Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-8 -left-8 md:bottom-12 md:-left-12 glass p-6 rounded-xl shadow-xl border border-white/40 max-w-[200px]"
            >
              <p className="text-4xl font-bold text-accent-orange mb-1">100%</p>
              <p className="text-sm font-medium text-concrete-700">Quality Assured Materials</p>
            </motion.div>

            {/* Floating Stat Card 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -top-8 -right-8 md:top-12 md:-right-12 glass p-6 rounded-xl shadow-xl border border-white/40 max-w-[200px]"
            >
              <p className="text-4xl font-bold text-steel-blue-600 mb-1">24/7</p>
              <p className="text-sm font-medium text-concrete-700">Automated AI Operations</p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
