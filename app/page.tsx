import Navbar from "@/components/home/navigation/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/hero/Hero";
import TrustedBy from "@/components/home/sections/TrustedBy";
import About from "@/components/home/sections/About";
import Products from "@/components/home/sections/Products";
import Services from "@/components/home/sections/Services";
import Projects from "@/components/home/sections/Projects";
import WhyChooseUs from "@/components/home/sections/WhyChooseUs";
import Statistics from "@/components/home/sections/Statistics";
import AIAssistantPreview from "@/components/home/sections/AIAssistantPreview";
import Testimonials from "@/components/home/sections/Testimonials";
import News from "@/components/home/sections/News";
import GalleryPreview from "@/components/home/sections/GalleryPreview";
import ContactCTA from "@/components/home/sections/ContactCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-pure-white selection:bg-accent-orange selection:text-pure-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <About />
      <Products />
      <Services />
      <Projects />
      <WhyChooseUs />
      <Statistics />
      <AIAssistantPreview />
      <Testimonials />
      <News />
      <GalleryPreview />
      <ContactCTA />
      <Footer />
    </main>
  );
}
