"use client";

const companies = [
  "Infrastructure Company",
  "Builders Co",
  "Gov Projects Ltd",
  "Residential Developers",
  "Commercial Projects",
  "Metro Contractors",
  "Highway Builders",
];

export default function TrustedBy() {
  return (
    <section className="py-20 bg-pure-white overflow-hidden border-b border-concrete-100">
      <div className="container mx-auto px-4 md:px-8 mb-12 text-center">
        <p className="text-sm font-semibold text-concrete-500 tracking-widest uppercase">Trusted By Industry Leaders</p>
      </div>
      
      <div className="relative w-full flex overflow-x-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-r from-pure-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 z-10 bg-gradient-to-l from-pure-white to-transparent pointer-events-none" />
        
        <div className="flex animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
          {[...companies, ...companies].map((company, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-center min-w-[250px] mx-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer"
            >
              <span className="text-xl md:text-2xl font-bold text-charcoal-black">{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
