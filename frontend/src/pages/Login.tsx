import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("bg-slate-50");
    return () => {
      document.body.classList.remove("bg-slate-50");
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        if (data.user?.role === 'admin' || data.user?.email === 'stusil.online@gmail.com') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
        toast.success("Welcome back!");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50/80 via-blue-50/30 to-cyan-50/40 text-zinc-950 flex flex-col justify-center items-center p-6 overflow-y-auto">
      
      {/* Background Grid and Mesh Orbs */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="absolute top-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative z-10 my-auto"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden shrink-0 shadow-inner">
            <img src="/logo.png" alt="Stusil Logo" className="h-8 w-8 object-contain" />
          </div>
          <span className="text-xl font-black tracking-widest text-zinc-900 uppercase">STUSIL</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to your creator account to continue building.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-700">Email Address</label>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/85 px-4 py-3 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
              <Mail className="h-4 w-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/85 px-4 py-3 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
              <Lock className="h-4 w-4 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="glow-button flex w-full items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>Sign In</span> 
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link to="/join" className="font-bold text-primary hover:underline">Join Stusil</Link>
        </p>
      </motion.div>
    </div>
  );
}
