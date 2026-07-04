import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowRight, Code, Rocket, Users, Zap, Search, ShieldCheck, Sun, Moon, Sparkles, ChevronDown, Star, Globe, Award } from "lucide-react";
import { getApiData } from "@/lib/api";

export default function Landing() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains("light"));
  const [stats, setStats] = useState({
    activeStudents: "10K+",
    projectsBuilt: "2,500+",
    teamsFormed: "500+",
    universities: "50+"
  });

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      document.documentElement.classList.add("light");
      setIsDark(false);
    }

    getApiData("/api/v1/community/stats")
      .then(data => {
        if (data) {
          const formatCount = (count: number, suffix = "+") => {
            if (count === undefined || count === null) return "0";
            if (count >= 1000) {
              return (count / 1000).toFixed(1).replace(/\.0$/, '') + "K" + suffix;
            }
            return count + suffix;
          };
          setStats({
            activeStudents: formatCount(data.activeStudents),
            projectsBuilt: formatCount(data.projectsBuilt),
            teamsFormed: formatCount(data.teamsFormed),
            universities: formatCount(data.universities)
          });
        }
      })
      .catch(err => {
        console.warn("Failed to fetch dynamic stats, using defaults:", err);
      });
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Main glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-glow-secondary/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }} />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/30"
            style={{ left: `${8 + i * 8}%`, top: `${10 + (i % 4) * 22}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}

        {/* Gradient mesh lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(239 84% 67%)" />
              <stop offset="100%" stopColor="hsl(280 80% 60%)" />
            </linearGradient>
          </defs>
          {[...Array(5)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${i * 25}%`} y1="0" x2={`${50 + i * 10}%`} y2="100%"
              stroke="url(#line-grad)" strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3 + i, ease: "easeOut" }}
            />
          ))}
        </svg>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-xl bg-background/60 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 overflow-hidden border border-border/30">
            <img src="/logo.png" alt="Stusil Logo" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight uppercase tracking-widest text-foreground">STUSIL</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/explore")} className="text-sm font-medium hover:text-primary transition-colors hidden md:block px-3 py-2">
            Explore
          </button>
          <button onClick={() => navigate("/login")} className="text-sm font-medium hover:text-primary transition-colors px-3 py-2 rounded-xl border border-border/50 hover:border-primary/30">
            Login
          </button>
          <button onClick={() => navigate("/join")} className="glow-button px-5 py-2.5 text-sm !rounded-xl">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 md:pt-52 md:pb-36 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-full"
            >
              <Sparkles className="h-3.5 w-3.5" /> The #1 Ecosystem for Student Innovators
            </motion.span>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05]">
              Connect. Build.{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-glow-secondary to-primary bg-[200%_auto] animate-[gradient-shift_3s_ease_infinite]">
                Launch your future.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Find co-founders, develop exciting projects, and connect with fellow students through a platform designed for the next generation of creators.
            </p>

            {/* CTA Buttons - properly centered and spaced */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/join")}
                className="glow-button flex items-center justify-center gap-2 px-8 py-4 text-base !rounded-full w-full sm:w-auto"
              >
                Join Stusil Today <ArrowRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/explore")}
                className="glow-button-outline px-8 py-4 text-base !rounded-full w-full sm:w-auto"
              >
                Explore Projects
              </motion.button>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-20 flex justify-center"
          >
            <ChevronDown className="h-6 w-6 text-muted-foreground/50" />
          </motion.div>
        </div>
      </section>

      {/* Showcase / Recent Competition */}
      <section className="py-20 px-6 relative z-10 border-y border-border/30 bg-secondary/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full uppercase tracking-widest">
                <Award className="h-3 w-3" /> Recent Competition
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                STUSIL x POLARIS <br/>
                <span className="text-muted-foreground">1-Week Challenge</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                We challenged students to pick a real community problem, brainstorm, and build a solution in just 1 week. The results were incredible.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-4 border border-border/50 text-center rounded-2xl">
                  <p className="text-3xl font-black text-foreground">55+</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-1">Registrations</p>
                </div>
                <div className="glass-card p-4 border border-border/50 text-center rounded-2xl">
                  <p className="text-3xl font-black text-foreground">15+</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-1">Submissions</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 w-full">
              <div className="glass-card border border-border/50 p-6 md:p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
                <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5" /> Hall of Fame
                </h3>
                
                <div className="space-y-4 relative z-10">
                  {[
                    { place: "1st Place", name: "Nirvana Ghezaei", project: "Saudi Arabia Project", color: "from-amber-400/20 to-orange-500/10" },
                    { place: "2nd Place", name: "Angel", project: "India Project: ITP Diagnostic Test", color: "from-slate-300/20 to-gray-400/10" },
                    { place: "3rd Place", name: "Milson Neill", project: "England Project: REVIZELY.AI", color: "from-amber-700/20 to-yellow-800/10" }
                  ].map((winner, i) => (
                    <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/50 bg-gradient-to-r ${winner.color} hover:border-primary/30 transition-all`}>
                      <div className="flex items-center gap-3 mb-2 sm:mb-0">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/50 text-xs font-black shadow-sm">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-foreground">{winner.name}</p>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{winner.place}</p>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <span className="inline-block rounded-lg bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground border border-border/50">
                          {winner.project}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Platform Features</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">Everything you need to succeed</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Powerful tools built exclusively for university students and young innovators.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Find Teammates", desc: "Discover students with complementary skills from across your campus and beyond.", icon: Users, gradient: "from-primary/20 to-glow-secondary/20" },
              { title: "Manage Projects", desc: "Organize tasks, share files, and collaborate seamlessly in real-time workspaces.", icon: Code, gradient: "from-blue-600/20 to-cyan-500/20" },
              { title: "Launch Ventures", desc: "Pitch your ideas, find co-founders, and get feedback from the community.", icon: Rocket, gradient: "from-indigo-600/20 to-blue-500/20" },
              { title: "Smart Matching", desc: "Our algorithm connects you with the right opportunities based on your skills.", icon: Search, gradient: "from-cyan-500/20 to-sky-400/20" },
              { title: "Verified Profiles", desc: "Connect with real students using verified university email addresses.", icon: ShieldCheck, gradient: "from-cyan-500/20 to-blue-500/20" },
              { title: "Global Community", desc: "Expand your network and learn from talented individuals worldwide.", icon: Globe, gradient: "from-indigo-500/20 to-sky-500/20" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 px-6 bg-secondary/5 border-y border-border/30 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Getting Started</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Your journey from idea to execution in 4 simple steps.</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Create Profile", desc: "Sign up and set your skills, university, and interests." },
              { step: "02", title: "Find a Team", desc: "Discover students with the skills you need or join a project." },
              { step: "03", title: "Collaborate", desc: "Use real-time messaging and file sharing to build together." },
              { step: "04", title: "Showcase", desc: "Publish completed projects to your public student portfolio." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-6 glass-card border border-border/50 group hover:border-primary/30 transition-all"
              >
                <div className="text-5xl font-black text-gradient opacity-20 absolute top-4 right-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2 mt-4">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="py-28 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 md:p-20 border border-primary/20 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-glow-secondary/10 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to build something amazing?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands of university students who are turning their ideas into reality on Stusil.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/join")}
              className="glow-button flex items-center justify-center gap-2 px-8 py-4 text-base !rounded-full mx-auto"
            >
              Get Started for Free <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-6 bg-card/30 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-glow-secondary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">STUSIL</span>
          </div>
          <div className="flex items-center gap-6 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Stusil. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Gradient animation keyframes */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
