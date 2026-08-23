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
    if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
      return "Invalid email address or password. Please check your credentials.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many failed attempts. Please reset your password or try again later.";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection error. Please check your internet connection.";
    }
    return err.message || "Invalid email address or password.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const res = await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to establish session");
      
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to log in");

      router.push(`/dashboard/${role.toLowerCase()}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Demo login failed.");
      setDemoRoleLoading(null);
    }
  };

  return (
    <div className="glass p-8 md:p-10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500 border border-white/40">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-black tracking-tighter flex items-baseline justify-center">
            <span className="text-[#DA291C] italic mr-1.5">VEERA</span>
            <span className="text-[#008C45]">CONCRETE</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-charcoal-black mb-2">Welcome Back</h1>
        <p className="text-concrete-500 text-sm">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-concrete-700">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-concrete-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none"
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-concrete-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-accent-orange hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-concrete-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none pr-10"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-concrete-400 hover:text-concrete-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="remember" className="rounded border-concrete-300 text-accent-orange focus:ring-accent-orange" />
          <label htmlFor="remember" className="text-sm text-concrete-600 cursor-pointer">Remember me for 30 days</label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-charcoal-black hover:bg-concrete-900 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer shadow-md"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Access Bar */}
      <div className="mt-8 pt-6 border-t border-concrete-200 text-center space-y-3">
        <span className="text-xs font-bold text-concrete-500 uppercase tracking-wider block">
          ⚡ Quick 1-Click Role Access:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {["Admin", "Customer", "Contractor", "Employee"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleQuickDemoLogin(r)}
              disabled={!!demoRoleLoading}
              className="px-2.5 py-1.5 bg-concrete-100 hover:bg-concrete-200 text-concrete-800 rounded-lg text-xs font-bold transition-all border border-concrete-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {demoRoleLoading === r ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-purple-600" /> {r}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-concrete-500">
        Don't have an account?{" "}
        <Link href="/register" className="text-accent-orange font-semibold hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
