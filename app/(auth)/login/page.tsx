"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoRoleLoading, setDemoRoleLoading] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const formatAuthError = (err: any) => {
    const code = err.code || "";
    if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-login-credentials") {
      return "Invalid email address or password. Please check your credentials.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many failed attempts. Please reset your password or try again later.";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection error. Please check your internet connection.";
    }
    if (err.message && !err.message.includes("<!DOCTYPE") && !err.message.includes("JSON")) {
      return err.message;
    }
    return "Invalid email address or password. Please check your credentials.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      let idToken: string | undefined = undefined;

      // 1. Try Client Firebase Authentication
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        idToken = await userCredential.user.getIdToken();
      } catch (fbErr: any) {
        console.warn("[Firebase Client Sign-In Warning, trying direct API authentication]:", fbErr.message);
      }

      // 2. Establish Session Cookie via API
      const res = await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idToken,
          email: email.trim(),
          password
        }),
      });

      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        console.error("Non-JSON API response received:", rawText);
        throw new Error("Invalid credentials or server unavailable. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to establish session");
      }
      
      const userRole = (data.data?.role || "customer").toLowerCase();
      router.push(`/dashboard/${userRole}`);
    } catch (error: any) {
      console.error("Login attempt error:", error);
      setErrorMsg(formatAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: string) => {
    setDemoRoleLoading(role);
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoRole: role }),
      });

      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Unable to establish demo session. Please try again.");
      }

      if (!res.ok) throw new Error(data?.message || "Failed to log in");

      router.push(`/dashboard/${role.toLowerCase()}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Demo login failed.");
      setDemoRoleLoading(null);
    }
  };

  return (
    <div className="glass p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl animate-in fade-in zoom-in-95 duration-500 border border-white/40 max-w-md w-full mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <Link href="/" className="inline-block mb-4 sm:mb-6">
          <span className="text-2xl font-black tracking-tighter flex items-baseline justify-center">
            <span className="text-[#DA291C] italic mr-1.5">VEERA</span>
            <span className="text-[#008C45]">CONCRETE</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-charcoal-black mb-1.5">Welcome Back</h1>
        <p className="text-concrete-500 text-xs sm:text-sm">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-concrete-700">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none text-sm text-charcoal-black"
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs sm:text-sm font-semibold text-concrete-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-accent-orange hover:underline font-bold">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none pr-10 text-sm text-charcoal-black"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-concrete-400 hover:text-concrete-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input type="checkbox" id="remember" className="rounded border-concrete-300 text-accent-orange focus:ring-accent-orange" />
          <label htmlFor="remember" className="text-xs sm:text-sm text-concrete-600 cursor-pointer font-medium">Remember me for 30 days</label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-charcoal-black hover:bg-concrete-900 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer shadow-md active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-concrete-200/80">
        <p className="text-[11px] font-extrabold text-concrete-500 uppercase tracking-wider text-center mb-3">
          ⚡ Quick 1-Click Role Access:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { role: "Admin", label: "Admin" },
            { role: "Customer", label: "Customer" },
            { role: "Contractor", label: "Contractor" },
            { role: "Employee", label: "Employee" }
          ].map(({ role, label }) => (
            <button
              key={role}
              type="button"
              disabled={!!demoRoleLoading}
              onClick={() => handleQuickDemoLogin(role)}
              className="py-2.5 px-3 bg-concrete-100/90 hover:bg-concrete-200/90 active:bg-concrete-300 border border-concrete-200 rounded-xl text-xs font-bold text-charcoal-black transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
            >
              {demoRoleLoading === role ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-orange" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-accent-orange" />
              )}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-concrete-500 font-medium">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent-orange font-bold hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
