"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleName, setRoleName] = useState("Customer");
  const [errorMsg, setErrorMsg] = useState("");

  const formatRegisterError = (err: any) => {
    const code = err.code || "";
    if (code === "auth/email-already-in-use") {
      return "An account with this email address already exists. Please log in instead.";
    }
    if (code === "auth/weak-password") {
      return "Password must be at least 6 characters long.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection error. Please check your internet connection.";
    }
    if (err.message && !err.message.includes("<!DOCTYPE") && !err.message.includes("JSON")) {
      return err.message;
    }
    return "Failed to create account. Please try again.";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      let idToken: string | undefined = undefined;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        idToken = await userCredential.user.getIdToken();
      } catch (fbErr: any) {
        console.warn("[Firebase Client Registration Warning, trying direct API account registration]:", fbErr.message);
      }

      const res = await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idToken, 
          email: email.trim(), 
          password,
          fullName: fullName.trim(), 
          phone: phone.trim(), 
          companyName: companyName.trim(), 
          roleName 
        }),
      });

      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Unable to complete registration. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Failed to establish session");
      }
      
      const selectedRole = roleName.toLowerCase();
      router.push(`/dashboard/${selectedRole}`);
    } catch (error: any) {
      console.error("Register error:", error);
      setErrorMsg(formatRegisterError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-6 sm:p-8 md:p-10 rounded-3xl shadow-xl animate-in fade-in zoom-in-95 duration-500 border border-white/40 my-6 max-w-lg w-full mx-auto">
      <div className="text-center mb-6 sm:mb-8">
        <Link href="/" className="inline-block mb-4">
          <span className="text-2xl font-black tracking-tighter flex items-baseline justify-center">
            <span className="text-[#DA291C] italic mr-1.5">VEERA</span>
            <span className="text-[#008C45]">CONCRETE</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-charcoal-black mb-1.5">Create an Account</h1>
        <p className="text-concrete-500 text-xs sm:text-sm">Join the leading ready mix concrete management platform</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-concrete-700">Full Name</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none text-sm text-charcoal-black"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-concrete-700">Role Selection</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none text-sm text-charcoal-black font-semibold"
            >
              <option value="Customer">Customer / Homeowner</option>
              <option value="Contractor">General Contractor / Builder</option>
              <option value="Employee">Employee / Quality Engineer</option>
              <option value="Admin">Operations Admin</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-concrete-700">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none text-sm text-charcoal-black"
            placeholder="you@company.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-concrete-700">Company Name (Optional)</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none text-sm text-charcoal-black"
              placeholder="e.g. Acme Infra Ltd"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-semibold text-concrete-700">Phone Number</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none text-sm text-charcoal-black"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-concrete-700">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none pr-10 text-sm text-charcoal-black"
              placeholder="Min. 6 characters"
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

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-charcoal-black hover:bg-concrete-900 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer shadow-md active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-concrete-500 font-medium">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-orange font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
