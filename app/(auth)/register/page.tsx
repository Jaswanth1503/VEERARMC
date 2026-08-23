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
    return err.message || "Failed to create account. Please try again.";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const res = await fetch("/api/v1/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, fullName, phone, companyName, roleName }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to establish session");
      
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
    <div className="glass p-8 md:p-10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-500 border border-white/40 my-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-4">
          <span className="text-2xl font-black tracking-tighter flex items-baseline justify-center">
            <span className="text-[#DA291C] italic mr-1.5">VEERA</span>
            <span className="text-[#008C45]">CONCRETE</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-charcoal-black mb-2">Create an Account</h1>
        <p className="text-concrete-500 text-sm">Join the leading ready mix concrete management platform</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-concrete-700">Full Name</label>
            <input 
              type="text" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-concrete-700">Account Type / Role</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none text-sm font-semibold"
            >
              <option value="Customer">Customer / Builder</option>
              <option value="Contractor">Civil Contractor</option>
              <option value="Supplier">Material Supplier</option>
              <option value="Employee">Plant Employee</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-concrete-700">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-concrete-700">Phone Number</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-concrete-700">Company (Optional)</label>
          <input 
            type="text" 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none"
            placeholder="BuildCorp Inc."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-concrete-700">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-concrete-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-accent-orange/20 focus:border-accent-orange transition-all outline-none pr-10"
              placeholder="Create a password (min 6 characters)"
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

        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" id="terms" required className="mt-1 rounded border-concrete-300 text-accent-orange focus:ring-accent-orange" />
          <label htmlFor="terms" className="text-xs text-concrete-600 cursor-pointer leading-tight">
            I agree to the <Link href="/" className="text-accent-orange hover:underline">Terms of Service</Link> and <Link href="/" className="text-accent-orange hover:underline">Privacy Policy</Link>.
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-charcoal-black hover:bg-concrete-900 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 cursor-pointer shadow-md"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-concrete-500">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-orange font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
