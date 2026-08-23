"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Truck, Droplet, Stethoscope, CheckSquare, Building, Map, ArrowRight } from "lucide-react";
import React from "react";

const services = [
  {
    icon: Truck,
    title: "Ready Mix Concrete",
    desc: "Premium grade concrete batched and delivered directly to your site with precision.",
  },
  {
    icon: Droplet,
    title: "Concrete Pumping",
    desc: "High-capacity pumping solutions for difficult-to-reach casting locations.",
  },
  {
    icon: Stethoscope,
    title: "Technical Consultation",
    desc: "Expert advice on mix designs tailored to your specific project requirements.",
  },
  {
    icon: CheckSquare,
    title: "On-site Quality Testing",
    desc: "Rigorous testing protocols implemented at your site for guaranteed strength.",
  },
  {
    icon: Building,
    title: "Large Scale Supply",
    desc: "Continuous, uninterrupted pouring operations for infrastructure mega-projects.",
  },
  {
    icon: Map,
    title: "Project Planning",
    desc: "AI-assisted logistics and pour scheduling for maximum efficiency and minimum waste.",
  },
];

export default function Services() {
  return (
    <section className="py-24 bg-concrete-50" id="services">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-charcoal-black mb-4"
          >
            Complete Construction Support
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-concrete-600"
          >
            End-to-end concrete solutions tailored for every scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative p-[1px] rounded-2xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl bg-concrete-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-steel-blue-400 via-transparent to-accent-orange opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-pure-white p-8 rounded-[15px] flex flex-col z-10">
                <div className="w-14 h-14 bg-concrete-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {React.createElement(service.icon, { className: "w-6 h-6 text-charcoal-black" })}
                </div>
                
                <h3 className="text-xl font-bold text-charcoal-black mb-3">{service.title}</h3>
                <p className="text-concrete-600 mb-8 flex-1 leading-relaxed">{service.desc}</p>
                
                <Link href="/quote" className="flex items-center gap-2 text-sm font-semibold text-steel-blue-600 group/btn mt-auto self-start">
                  Explore Service
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
