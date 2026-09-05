import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import Starfield from "../components/StarFild";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <Starfield theme="graphite-turquoise" />

      <div className="relative z-10 w-full max-w-md">
        <div className="space-y-8 rounded-3xl border border-cyan-200/25 bg-[#202a2e]/50 p-6 shadow-2xl shadow-black/20 backdrop-blur-[2px] sm:p-10">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/30 bg-cyan-300/15"
              >
                <MessageSquare className="h-6 w-6 text-cyan-200" />
              </div>
              <h1 className="text-2xl font-bold text-cyan-100">
                Welcome Back
              </h1>
              <p className="text-white/65">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                  <span className="label-text font-medium text-white">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-cyan-100/60" />
                </div>
                <input
                  type="email"
                  className="input w-full border-cyan-100/25 bg-black/20 pl-10 text-white placeholder:text-white/45 focus:border-cyan-100 focus:outline-none"
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
                  <Lock className="h-5 w-5 text-cyan-100/60" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input w-full border-cyan-100/25 bg-black/20 pl-10 text-white placeholder:text-white/45 focus:border-cyan-100 focus:outline-none"
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
                    <EyeOff className="h-5 w-5 text-cyan-100/60" />
                  ) : (
                    <Eye className="h-5 w-5 text-cyan-100/60" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn w-full border-cyan-100/80 bg-[#c8e8e7] text-lg font-semibold text-[#203438] shadow-[0_0_18px_rgba(45,212,191,0.22)] transition-all duration-300 ease-out hover:scale-[1.02] hover:border-cyan-50 hover:bg-[#dcf3f0] hover:shadow-[0_0_26px_rgba(45,212,191,0.34)] disabled:bg-[#c8e8e7]/60"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-white/65">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="link text-cyan-200 drop-shadow-[0_2px_8px_rgba(45,212,191,0.28)] hover:text-cyan-100"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
