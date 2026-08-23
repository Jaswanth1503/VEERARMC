"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Only run Lenis smooth scroll on public marketing pages (e.g. landing page '/')
    // In application dashboards & workspaces, allow native mouse wheel scrolling
    const isAppWorkspace = 
      pathname?.startsWith("/dashboard") ||
      pathname?.startsWith("/orders") ||
      pathname?.startsWith("/production") ||
      pathname?.startsWith("/logistics") ||
      pathname?.startsWith("/analytics") ||
      pathname?.startsWith("/quote") ||
      pathname?.startsWith("/blueprint-analyzer") ||
      pathname?.startsWith("/quality-predictor") ||
      pathname?.startsWith("/recommendations") ||
      pathname?.startsWith("/ai-assistant") ||
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/register");

    if (isAppWorkspace) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
