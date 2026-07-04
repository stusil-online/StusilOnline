import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles, Rocket, Users, Globe, ArrowRight, ExternalLink,
  Search, Eye, Heart, MessageCircle, Code, Briefcase
} from "lucide-react";
import { getApiData } from "@/lib/api";

export default function Explore() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getApiData("/api/v1/projects");
        if (Array.isArray(data)) {
          setProjects(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  const publicProjects = projects.slice(0, 6);
  const featuredProjects = projects.filter(p => p.roles && p.roles.some((r: any) => !r.is_filled)).slice(0, 5);

  const cardGradients = [
    "from-blue-600 to-cyan-500",
    "from-indigo-600 to-blue-500",
    "from-primary to-glow-secondary",
    "from-cyan-600 to-sky-500",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-20 right-20 h-60 w-60 rounded-full bg-glow-secondary/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">STUSIL</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="glow-button-outline px-4 py-2 text-sm">Sign In</Link>
          <Link to="/join" className="glow-button px-4 py-2 text-sm">Join Now</Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-20 text-center lg:pt-32"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Now in Beta
        </div>
        <h1 className="heading-tight text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
          Where student ideas{" "}
          <span className="text-gradient">meet skills</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
          Find teammates, build real projects, and launch ventures — all while you're still in school.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/join" className="glow-button flex items-center gap-2 text-sm">
            <Rocket className="h-4 w-4" /> Get Started
          </Link>
          <a href="#explore" className="glow-button-outline flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4" /> Explore
          </a>
        </div>
      </motion.section>

      {/* Public Projects */}
      <section id="explore" className="relative z-10 mx-auto max-w-6xl px-6 pb-16">
        <h2 className="heading-tight mb-8 text-2xl font-bold text-foreground">Trending Projects</h2>
        {publicProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicProjects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring", damping: 25 }}
                viewport={{ once: true }}
                onClick={() => navigate('/login')}
                className="glass-card-hover group cursor-pointer overflow-hidden flex flex-col h-full"
              >
                <div className={`h-32 bg-gradient-to-br ${cardGradients[i % cardGradients.length]} opacity-80 transition-opacity group-hover:opacity-100 flex items-center justify-center relative`}>
                   {p.banner_image ? (
                      <img src={p.banner_image} className="h-full w-full object-cover absolute inset-0" />
                   ) : (
                      <Code className="h-12 w-12 text-white/30" />
                   )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="heading-tight text-lg font-semibold text-foreground line-clamp-1">{p.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground truncate">by {p.owner?.full_name || "Anonymous"}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{p.field}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-3xl">
            No projects available right now. Be the first to start one!
          </div>
        )}
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
          <h2 className="heading-tight mb-8 text-2xl font-bold text-foreground">Featured Projects Looking for Members</h2>
          <div className="space-y-3">
            {featuredProjects.map((p, i) => {
              const openRole = p.roles.find((r: any) => !r.is_filled);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, type: "spring", damping: 25 }}
                  viewport={{ once: true }}
                  className="glass-card-hover flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{p.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">by {p.owner?.full_name}</p>
                  </div>
                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary whitespace-nowrap">{openRole?.title || "Team Member"}</span>
                    <Link to="/login" className="glow-button-outline px-3 py-1.5 text-xs whitespace-nowrap">Apply</Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 px-6 py-8 text-center text-xs text-muted-foreground">
        © 2026 Stusil. Built for students, by students.
      </footer>
    </div>
  );
}
