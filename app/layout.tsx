import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/animations/SmoothScroll";
import { cn } from "@/lib/utils";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#FF5A00"
};

export const metadata: Metadata = {
  title: "Veera RMC | AI Powered Ready Mix Concrete Solutions",
  description: "Enterprise-grade Ready Mix Concrete Management Platform powered by AI. Delivering Strength Today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased bg-pure-white text-charcoal-black overflow-x-hidden min-h-screen">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
