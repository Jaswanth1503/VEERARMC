"use client";

import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import TiltCard from "@/components/cards/TiltCard";
import { motion } from "framer-motion";

const products = [
  { grade: "M10", strength: "10 MPa", applications: "Leveling course, Bedding", desc: "Low-strength concrete ideal for non-structural foundation work." },
  { grade: "M15", strength: "15 MPa", applications: "PCC, Flooring", desc: "Used in plain cement concrete works and temporary structures." },
  { grade: "M20", strength: "20 MPa", applications: "Slabs, Beams, Columns", desc: "Standard grade for residential and domestic construction." },
  { grade: "M25", strength: "25 MPa", applications: "Foundations, RCC", desc: "Highly recommended for robust load-bearing structures." },
  { grade: "M30", strength: "30 MPa", applications: "Commercial, Heavy RCC", desc: "High durability grade for commercial complexes." },
  { grade: "M35", strength: "35 MPa", applications: "Piling, Retaining walls", desc: "Superior strength for extreme environmental conditions." },
  { grade: "M40", strength: "40 MPa", applications: "Pre-stressed concrete", desc: "Advanced grade for infrastructure and bridges." },
  { grade: "M50", strength: "50 MPa", applications: "High-rise, Runways", desc: "Ultra-high performance concrete for mega projects." },
];

export default function Products() {
  return (
    <section className="py-24 bg-pure-white" id="products">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-charcoal-black mb-4"
          >
            Premium Concrete Solutions
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-concrete-600"
          >
            Designed for every construction requirement.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.grade}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <TiltCard className="h-full bg-concrete-50 border border-concrete-100 p-8 hover:bg-pure-white hover:border-transparent group relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-steel-blue-600/5 via-transparent to-accent-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute -inset-[1px] bg-gradient-to-br from-steel-blue-400 to-accent-orange opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-500 pointer-events-none -z-10" />
                
                <div style={{ transform: "translateZ(30px)" }} className="relative">
                  <div className="w-14 h-14 bg-pure-white rounded-lg shadow-sm border border-concrete-100 flex items-center justify-center mb-6 group-hover:shadow-md transition-shadow">
                    <Layers className="w-6 h-6 text-steel-blue-600" />
                  </div>
                  
                  <div className="flex items-end gap-3 mb-2">
                    <h3 className="text-3xl font-bold text-charcoal-black">{product.grade}</h3>
                    <span className="text-sm font-semibold text-accent-orange mb-1">{product.strength}</span>
                  </div>
                  
                  <p className="text-sm font-medium text-concrete-800 mb-3">{product.applications}</p>
                  <p className="text-sm text-concrete-500 mb-8 leading-relaxed">
                    {product.desc}
                  </p>
                  
                  <Link href={`/quote?grade=${product.grade}`} className="text-sm font-semibold text-steel-blue-600 flex items-center gap-1 group/btn hover:text-charcoal-black transition-colors mt-auto">
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
