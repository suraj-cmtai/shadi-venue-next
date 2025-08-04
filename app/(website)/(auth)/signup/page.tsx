"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { signup } from "@/lib/redux/features/authSlice";
import { UserCircle2, Mail, Lock, Eye, EyeOff, Loader2, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dispatch(signup({ name, email, password })).unwrap();
      toast.success("Account created successfully!");
      router.push("/profile");
    } catch (error: unknown) {
      // Handle specific error messages from the API
      let errorMessage = "Signup failed. Please try again.";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy/5 via-blue-50/30 to-orange-50/20 px-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange to-orange/80 rounded-full flex items-center justify-center mb-4">
            <UserCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-navy">Create Account</h2>
          <p className="text-gray-600 text-sm mt-1">Sign up to get started</p>
        </div>
        
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
        
        <form className="w-full space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Full Name</label>
            <div className="relative">
              <Input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange/20"
                required
                autoFocus
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Email</label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange/20"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="pl-10 pr-10 border-gray-300 focus:border-orange focus:ring-orange/20"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-gradient-to-r from-orange to-orange/80 hover:from-orange/90 hover:to-orange text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-orange font-medium hover:text-orange/80 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
