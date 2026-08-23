"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Calendar, Layers } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Apollo Hospital Extension",
    location: "City Center",
    grade: "M40 & M50",
    date: "Dec 2025",
    size: "45,000 cu.m",
    category: "Hospital",
    image: "/api/placeholder/800/600",
  },
  {
    id: 2,
    title: "Tech Park Phase 3",
    location: "Silicon Valley Road",
    grade: "M30",
    date: "Oct 2025",
    size: "120,000 cu.m",
    category: "Commercial",
    image: "/api/placeholder/800/600",
  },
  {
    id: 3,
    title: "Eastern Metro Line",
    location: "Suburban Route",
    grade: "M50",
    date: "In Progress",
    size: "250,000 cu.m",
    category: "Infrastructure",
    image: "/api/placeholder/800/600",
  },
  {
    id: 4,
    title: "Riverfront Residences",
    location: "Marina Bay",
    grade: "M25",
    date: "Jan 2026",
    size: "60,000 cu.m",
    category: "Residential",
    image: "/api/placeholder/800/600",
  },
];

export default function Projects() {
  return (
    <section className="py-24 bg-pure-white" id="projects">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-charcoal-black mb-4"
            >
              Projects That Built Trust
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-concrete-600"
            >
              A showcase of our commitment to quality across residential, commercial, and infrastructure sectors.
            </motion.p>
          </div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="px-6 py-3 border border-concrete-300 rounded-md text-charcoal-black font-medium hover:bg-concrete-50 transition-colors whitespace-nowrap"
          >
            View All Projects
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-concrete-100 aspect-[4/3] md:aspect-[16/10] cursor-pointer"
            >
              {/* Placeholder image background */}
              <div className="absolute inset-0 bg-concrete-300 transition-transform duration-700 group-hover:scale-105">
                 <div className="w-full h-full bg-gradient-to-tr from-concrete-700 to-concrete-400 opacity-30 mix-blend-overlay" />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black/90 via-charcoal-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 bg-pure-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-pure-white border border-white/30">
                  {project.category}
                </span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-pure-white mb-4">{project.title}</h3>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-concrete-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent-orange" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent-orange" />
                    {project.grade}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent-orange" />
                    {project.date}
                  </div>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  <button className="flex items-center gap-2 font-medium text-accent-orange hover:text-white transition-colors">
                    View Case Study
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
