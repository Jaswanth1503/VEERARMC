import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export default function Footer() {
  return (
    <footer className="bg-charcoal-black text-concrete-300 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tighter mb-6 flex items-baseline">
              <span className="text-[#DA291C] italic font-black mr-1.5">VEERA</span>
              <span className="text-[#008C45]">CONCRETE</span>
            </Link>
            <p className="text-sm mb-6 text-concrete-400">
              AI-Powered Smart Ready Mix Concrete Management Platform. Delivering strength, reliability, and precision.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-pure-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-pure-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-pure-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-pure-white transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-pure-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-accent-orange transition-colors">Home</Link></li>
              <li><Link href="/#about" className="hover:text-accent-orange transition-colors">About Us</Link></li>
              <li><Link href="/#products" className="hover:text-accent-orange transition-colors">Products</Link></li>
              <li><Link href="/#projects" className="hover:text-accent-orange transition-colors">Projects</Link></li>
              <li><Link href="/#services" className="hover:text-accent-orange transition-colors">Services</Link></li>
              <li><Link href="/#gallery" className="hover:text-accent-orange transition-colors">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-pure-white font-semibold mb-6">Solutions</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/#products" className="hover:text-accent-orange transition-colors">Concrete Grades</Link></li>
              <li><Link href="/quote" className="hover:text-accent-orange transition-colors">AI Quote Generator</Link></li>
              <li><Link href="/recommendations" className="hover:text-accent-orange transition-colors">Live Truck Tracking & Delivery</Link></li>
              <li><Link href="/quote" className="hover:text-accent-orange transition-colors">Project Calculator</Link></li>
              <li><Link href="/blueprint-analyzer" className="hover:text-accent-orange transition-colors">Blueprint Analyzer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-pure-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/news" className="hover:text-accent-orange transition-colors">News & Blogs</Link></li>
              <li><Link href="/privacy" className="hover:text-accent-orange transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent-orange transition-colors">Terms of Service</Link></li>
              <li><Link href="/csr" className="hover:text-accent-orange transition-colors">CSR Activities</Link></li>
              <li><Link href="/contact" className="hover:text-accent-orange transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-pure-white font-semibold mb-6">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe for latest updates and insights.</p>
            <div className="flex gap-2 mb-6">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-concrete-800 border border-concrete-700 rounded-md px-4 py-2 w-full text-sm text-pure-white focus:outline-none focus:border-accent-orange"
              />
              <button className="bg-accent-orange text-pure-white p-2 rounded-md hover:bg-orange-600 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-concrete-400">
              <p>Email: contact@veerarmc.com</p>
              <p>Support: +1 (800) 123-4567</p>
              <p className="text-accent-orange">Emergency: +1 (800) 999-0000</p>
            </div>
          </div>
        </div>

        <div className="border-t border-concrete-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-concrete-500">
          <p>© {new Date().getFullYear()} Veera RMC. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-pure-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-pure-white transition-colors">Terms</Link>
            <Link href="/cookie" className="hover:text-pure-white transition-colors">Cookie Policy</Link>
            <Link href="/sitemap" className="hover:text-pure-white transition-colors">Site Map</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
