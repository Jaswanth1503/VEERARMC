"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Bot, User, Sparkles, FileText, ArrowRight, Activity } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function AIAssistantPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [typedText, setTypedText] = useState("");
  const fullText = "M25 is generally suitable for standard residential villas, depending on specific structural load requirements. Would you like me to generate a precise quotation or analyze your structural blueprints to confirm?";

  useEffect(() => {
    if (isInView) {
      let currentLength = 0;
      const interval = setInterval(() => {
        if (currentLength <= fullText.length) {
          setTypedText(fullText.substring(0, currentLength));
          currentLength++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isInView, fullText]);

  return (
    <section className="py-24 bg-charcoal-black relative overflow-hidden" id="ai-assistant">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-steel-blue-600/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-orange/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10" ref={containerRef}>
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="glass-dark rounded-2xl p-6 md:p-8 w-full max-w-xl mx-auto shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-concrete-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center border border-accent-orange/50">
                    <Bot className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div>
                    <h4 className="text-pure-white font-semibold">Veera AI</h4>
                    <p className="text-xs text-success-green flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success-green block" />
                      Online
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex gap-4 justify-end"
                >
                  <div className="bg-concrete-800 text-pure-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                    <p className="text-sm">What concrete grade is best for a villa?</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-steel-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-pure-white" />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-accent-orange flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-pure-white" />
                  </div>
                  <div className="bg-concrete-900 border border-concrete-800 text-concrete-300 p-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm relative">
                    <p className="text-sm leading-relaxed">
                      {typedText}
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-1.5 h-4 bg-accent-orange ml-1 align-middle"
                      />
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 pt-4 border-t border-concrete-800 flex gap-2">
                <div className="flex-1 bg-concrete-900 border border-concrete-800 rounded-full px-4 py-2.5 text-sm text-concrete-500">
                  Ask a question...
                </div>
                <div className="w-10 h-10 rounded-full bg-charcoal-black border border-concrete-800 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-concrete-500" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-pure-white mb-6 leading-tight">
                Your Personal <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-warning-amber">
                  Concrete Engineer
                </span>
              </h2>
              <p className="text-concrete-400 text-lg mb-8 leading-relaxed max-w-lg">
                Meet Veera AI. From calculating mix ratios to analyzing structural blueprints, our proprietary AI model accelerates your planning phase and eliminates guesswork.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: FileText, text: "Instant Quotation Generation" },
                  { icon: Activity, text: "Automated Blueprint Analysis" },
                  { icon: Sparkles, text: "Smart Mix Recommendations" }
                ].map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-4 bg-concrete-900/50 p-4 rounded-xl border border-concrete-800"
                  >
                    <div className="w-10 h-10 rounded-lg bg-charcoal-black border border-concrete-700 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-steel-blue-400" />
                    </div>
                    <span className="text-pure-white font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/ai-assistant" className="px-8 py-4 bg-accent-orange text-pure-white rounded-md font-medium hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,90,0,0.3)] hover:shadow-[0_0_30px_rgba(255,90,0,0.5)] flex items-center gap-2 group">
                  Try AI Assistant
                  <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Link>
                <Link href="/blueprint-analyzer" className="px-8 py-4 bg-transparent border border-concrete-700 text-pure-white rounded-md font-medium hover:bg-concrete-900 transition-all">
                  Analyze Blueprint
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
