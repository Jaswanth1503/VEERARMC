"use client";

import { motion } from "framer-motion";
import { Maximize2, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const images = [
  { id: 1, title: "Modern Batching Plant", aspect: "aspect-[4/5]", size: "lg:col-span-4 lg:row-span-2" },
  { id: 2, title: "Automated Conveyor", aspect: "aspect-square", size: "lg:col-span-4 lg:row-span-1" },
  { id: 3, title: "Transit Mixers", aspect: "aspect-[4/3]", size: "lg:col-span-4 lg:row-span-1" },
  { id: 4, title: "Quality Lab", aspect: "aspect-[16/9]", size: "lg:col-span-8 lg:row-span-1" },
];

export default function GalleryPreview() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="py-24 bg-charcoal-black text-pure-white" id="gallery">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Visual Quality
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-concrete-400"
          >
            A glimpse into our state-of-the-art facilities and operations.
          </motion.p>
        </div>

        {/* Masonry-like Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[250px]">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "group relative rounded-xl overflow-hidden cursor-pointer bg-concrete-800",
                img.size
              )}
              onMouseEnter={() => setHovered(img.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-concrete-700 to-concrete-900 opacity-50 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
              
              <div className="absolute inset-0 bg-charcoal-black/20 group-hover:bg-charcoal-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                <div className="w-12 h-12 rounded-full bg-pure-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4">
                  <Maximize2 className="w-5 h-5 text-pure-white" />
                </div>
                <h3 className="text-xl font-bold text-pure-white">{img.title}</h3>
                <p className="text-sm text-concrete-300 mt-2">Click to view</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="px-8 py-4 bg-transparent border border-concrete-700 text-pure-white rounded-md font-medium hover:bg-concrete-900 transition-all">
            View Full Gallery
          </button>
        </div>
      </div>
    </section>
  );
}
