import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import Starfield from "../components/StarFild";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      signup(formData).then((created) => {
        if (created) navigate("/onboarding");
      });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <Starfield theme="burnt-orange" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-orange-200/25 bg-[#3d281e]/55 p-6 text-white backdrop-blur-[4px] sm:p-10">
        <div className="space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl border border-orange-100/30 bg-orange-200/10 flex items-center justify-center transition-colors group-hover:bg-orange-200/20"
              >
                <MessageSquare className="size-6 text-orange-100" />
              </div>
              <h1 className="mt-2 text-2xl font-bold text-white">Create Account</h1>
              <p className="text-white/65">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-white">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-orange-100/60" />
                </div>
                <input
                  type="text"
                  className="input w-full border-orange-100/25 bg-black/20 pl-10 text-white placeholder:text-white/45 focus:border-orange-100 focus:outline-none"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-white">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-orange-100/60" />
                </div>
                <input
                  type="email"
                  className="input w-full border-orange-100/25 bg-black/20 pl-10 text-white placeholder:text-white/45 focus:border-orange-100 focus:outline-none"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-white">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-orange-100/60" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input w-full border-orange-100/25 bg-black/20 pl-10 text-white placeholder:text-white/45 focus:border-orange-100 focus:outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-orange-100/60" />
                  ) : (
                    <Eye className="size-5 text-orange-100/60" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-full border-orange-100/80 bg-[#f3d3a3] text-lg font-semibold text-[#3d281e] shadow-[0_0_20px_rgba(251,146,60,0.18)] transition-all duration-300 ease-out hover:scale-[1.02] hover:border-orange-50 hover:bg-[#f7dfbb] hover:shadow-[0_0_28px_rgba(251,146,60,0.3)] disabled:bg-[#f3d3a3]/60"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-white/65">
              Already have an account?{" "}
              <Link
                to="/login"
                className="link text-orange-100 drop-shadow-[0_2px_8px_rgba(251,146,60,0.22)] hover:text-orange-50"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
