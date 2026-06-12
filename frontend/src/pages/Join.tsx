import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Sparkles, Code, Target, Rocket, Users } from "lucide-react";
import { toast } from "sonner";

export default function Join() {
  const [form, setForm] = useState({
    name: "", email: "", password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("bg-slate-50");
    return () => {
      document.body.classList.remove("bg-slate-50");
    };
  }, []);

  const canSubmit = () => {
    return form.name && form.email && form.password;
  };

  const handleFinish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const storedAnswers = JSON.parse(localStorage.getItem("onboarding_answers") || "{}");

      const payload = {
        email: form.email,
        password: form.password,
        username: form.email.split('@')[0] + Math.floor(Math.random() * 1000),
        full_name: form.name,
        university: storedAnswers.university || "University Student",
        country: storedAnswers.country || "Earth",
        dob: storedAnswers.dob || "2000-01-01",
        field_of_study: storedAnswers.field || "Not Specified",
        bio: `Role: ${storedAnswers.role || "Student"} | Goal: ${storedAnswers.goal || "Build projects"} | Skill Level: ${storedAnswers.skill || "Beginner"} | Lab: ${storedAnswers.lab || "Core"}`,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Welcome to Stusil!");
        navigate("/dashboard");
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
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

        <div>
          <AnimatePresence mode="wait">
            <motion.div key="step0" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2 text-center">Create account</h2>
              <p className="mb-8 text-sm text-zinc-500 text-center">Join thousands of university innovators building the future.</p>
              
              <form onSubmit={handleFinish} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700">Full Name</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/85 px-4 py-3 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                    <User className="h-4.5 w-4.5 text-zinc-400" />
                    <input 
                      required 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="Alex Johnson" 
                      className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700">University Email</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/85 px-4 py-3 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                    <Mail className="h-4.5 w-4.5 text-zinc-400" />
                    <input 
                      required 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      placeholder="you@university.edu" 
                      className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-700">Password</label>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/85 px-4 py-3 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                    <Lock className="h-4.5 w-4.5 text-zinc-400" />
                    <input 
                      required 
                      type="password" 
                      value={form.password} 
                      onChange={(e) => setForm({ ...form, password: e.target.value })} 
                      placeholder="••••••••" 
                      className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400" 
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between pt-2">
                  <Link to="/login" className="text-sm font-bold text-primary hover:underline transition-all">
                    Log In instead
                  </Link>

                  <button 
                    type="submit" 
                    disabled={!canSubmit() || loading} 
                    className="glow-button flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold shadow-md shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <span>Sign Up</span> 
                        <Rocket className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
