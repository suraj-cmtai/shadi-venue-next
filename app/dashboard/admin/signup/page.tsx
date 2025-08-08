"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { signup } from "@/lib/redux/features/authSlice";
import { UserCircle2, Mail, Lock, Eye, EyeOff, Loader2, User, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import GradientButton from "@/components/GradientButton";
import { Button } from "@/components/ui/button";

/**
 * Roles available for admin signup.
 * You can extend this list as needed.
 */
const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "hotel", label: "Hotel Manager" },
  { value: "vendor", label: "Vendor" },
  { value: "user", label: "User" },
];

const AdminSignupPage = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0].value);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  /**
   * Handles the admin signup form submission.
   * Does not redirect after signup; shows toast and error states.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await dispatch(signup({ name, email, password, role })).unwrap();
      toast.success("Account created successfully!");
    } catch (error: unknown) {
      let errorMessage = "Signup failed. Please try again.";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95  flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <p className="text-gray-600 text-sm mt-1">Create a new Account</p>
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
                placeholder="Jane Admin"
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange/20"
                required
                autoFocus
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Role</label>
            <div className="relative">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full pl-10 border-gray-300 focus:border-orange focus:ring-orange/20">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </span>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Email</label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@email.com"
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={loading}
            aria-label="Create Account"
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
      </div>
    </div>
  );
};

export default AdminSignupPage;
