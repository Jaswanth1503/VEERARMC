"use client";

import { motion } from "framer-motion";
import { Star, Play, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Rajesh Kumar",
    company: "Apex Infrastructure",
    project: "Eastern Metro Line",
    rating: 5,
    text: "Veera RMC's quality consistency and timely delivery were crucial for our metro project. Their AI scheduling tool ensured zero downtime during the continuous pour of the foundation rafts.",
    year: "2025"
  },
  {
    name: "Sarah Jenkins",
    company: "Skyline Developers",
    project: "Tech Park Phase 3",
    rating: 5,
    text: "The M40 grade provided by Veera exceeded our strength requirements. Their on-site testing team is highly professional and the detailed reporting gave our stakeholders immense confidence.",
    year: "2024"
  },
  {
    name: "Amit Desai",
    company: "Desai Builders",
    project: "Riverfront Residences",
    rating: 5,
    text: "Switching to Veera RMC was the best decision for our high-rise project. The pumpability of their mix is exceptional, significantly reducing our labor costs and pouring time.",
    year: "2025"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-concrete-50 overflow-hidden" id="testimonials">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16">
          
          <div className="w-full lg:w-1/3 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-charcoal-black mb-6 leading-tight">
                Trusted by Builders Across Every Project
              </h2>
              <p className="text-lg text-concrete-600 mb-8 leading-relaxed">
                Don't just take our word for it. Hear from the engineers, architects, and developers who rely on our strength.
              </p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex text-warning-amber">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-current" />)}
                </div>
                <div className="text-charcoal-black font-bold text-xl">4.9/5</div>
                <div className="text-concrete-500 text-sm">Based on 250+ reviews</div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={prev}
                  className="w-12 h-12 rounded-full border border-concrete-300 flex items-center justify-center hover:bg-charcoal-black hover:text-pure-white hover:border-charcoal-black transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={next}
                  className="w-12 h-12 rounded-full border border-concrete-300 flex items-center justify-center hover:bg-charcoal-black hover:text-pure-white hover:border-charcoal-black transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Carousel Card */}
              <motion.div 
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-pure-white p-8 md:p-10 rounded-2xl shadow-xl border border-concrete-100 relative h-full flex flex-col"
              >
                <Quote className="w-12 h-12 text-concrete-200 absolute top-8 right-8 rotate-180" />
                <div className="flex text-warning-amber mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-lg text-charcoal-black font-medium leading-relaxed mb-8 flex-1">
                  "{testimonials[currentIndex].text}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 bg-concrete-200 rounded-full flex items-center justify-center text-concrete-600 font-bold text-xl">
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal-black">{testimonials[currentIndex].name}</h4>
                    <p className="text-sm text-concrete-500">{testimonials[currentIndex].company} • {testimonials[currentIndex].project} ({testimonials[currentIndex].year})</p>
                  </div>
                </div>
              </motion.div>

              {/* Video Testimonial Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative rounded-2xl overflow-hidden shadow-xl aspect-square md:aspect-auto h-full cursor-pointer"
              >
                <div className="absolute inset-0 bg-concrete-800">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888081622-c4391cbcf40e?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-16 h-16 rounded-full bg-accent-orange/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,90,0,0.5)]">
                    <Play className="w-6 h-6 text-pure-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-charcoal-black/90 to-transparent z-10">
                  <span className="px-2 py-1 bg-charcoal-black/50 backdrop-blur-md text-pure-white text-xs font-semibold rounded mb-3 inline-block border border-white/20">
                    2:45
                  </span>
                  <h4 className="font-bold text-pure-white text-lg">Watch: Metro Project Success Story</h4>
                  <p className="text-sm text-concrete-300">Mr. Sharma, Chief Engineer</p>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
