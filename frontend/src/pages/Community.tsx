import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Star, Rocket, Eye, Flame, Trophy, Plus, ArrowUpRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNavigate } from "react-router-dom";
import { getApiData } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Community() {
  const [trending, setTrending] = useState<{ trendingProjects: any[], hotIdeas: any[], topStudents: any[] }>({ trendingProjects: [], hotIdeas: [], topStudents: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const data = await getApiData("/api/v1/community/trending");
        setTrending(data);
      } catch (err) {
        console.error("Error fetching trending:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h1 className="heading-tight text-4xl font-black text-foreground lg:text-5xl tracking-tight">The Hype</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Real-time pulse of the most ambitious student projects. Join the movement.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-80 rounded-[2.5rem] w-full" />
                <Skeleton className="h-80 rounded-[2.5rem] w-full" />
                <Skeleton className="h-80 rounded-[2.5rem] w-full" />
                <Skeleton className="h-80 rounded-[2.5rem] w-full" />
             </div>
             <div className="lg:col-span-4 space-y-6">
                <Skeleton className="h-24 rounded-2xl w-full" />
                <Skeleton className="h-24 rounded-2xl w-full" />
                <Skeleton className="h-24 rounded-2xl w-full" />
             </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Hot Ideas & Community Pulse */}
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Rocket className="h-4 w-4 text-indigo-500" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Hot Ideas</h2>
                </div>

                <div className="space-y-4">
                  {trending.hotIdeas.map((idea, i) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => navigate('/projects')}
                      className="group cursor-pointer"
                    >
                      <GlassCard className="p-5 border-indigo-500/20 glass-card-hover relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                        <h4 className="text-sm font-bold text-foreground mb-2 group-hover:text-indigo-500 transition-colors">{idea.title}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">by {idea.creator.full_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-500">
                             <Flame className="h-3 w-3" /> {idea.joinRequests} applicants
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                  {trending.hotIdeas.length === 0 && (
                    <div className="py-10 text-center border border-dashed border-border/20 rounded-2xl text-muted-foreground text-xs">
                      No hot ideas yet. Post one now!
                    </div>
                  )}
                </div>
              </section>

              {/* Top Students Mini-Leaderboard */}
              <section className="mt-8">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                       <Trophy className="h-4 w-4 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Top Innovators</h2>
                 </div>
                 
                 <div className="space-y-3">
                    {trending.topStudents?.map((u, i) => (
                       <motion.div
                          key={u.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => navigate(`/u/${u.username}`)}
                          className="group flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-secondary/5 hover:border-primary/20 transition-all cursor-pointer"
                       >
                          <div className="w-5 text-center text-[10px] font-black text-muted-foreground group-hover:text-primary">#{i + 1}</div>
                          <div className="h-8 w-8 rounded-lg overflow-hidden border border-border/50 bg-secondary/20 flex-shrink-0">
                             {u.profile_image ? (
                                <img src={u.profile_image} className="h-full w-full object-cover" />
                             ) : (
                                <div className="h-full w-full flex items-center justify-center text-[9px] font-black text-primary uppercase">
                                   {u.full_name?.substring(0, 2) || "U"}
                                </div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-xs font-bold text-foreground truncate">{u.full_name}</p>
                             <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">@{u.username} • {u.xp} XP</p>
                          </div>
                       </motion.div>
                    ))}
                    
                    <button 
                       onClick={() => navigate('/leaderboard')}
                       className="w-full py-2.5 rounded-xl border border-dashed border-border/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary transition-all text-center mt-2 group"
                    >
                       See Full Hall of Fame <ArrowUpRight className="inline-block h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                 </div>
              </section>

              <GlassCard className="p-6 border-primary/20 bg-secondary/10">
                <div className="flex items-center gap-2 mb-4">
                   <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
                   <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Community Pulse</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  Our ranking algorithm weighs <strong>recent engagement</strong>, <strong>star velocity</strong>, and <strong>view counts</strong> to surface the most promising student ventures.
                </p>
                <div className="space-y-3">
                   <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter">
                      <span className="text-muted-foreground">Star Weight</span>
                      <span className="text-primary">x5 Points</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-tighter">
                      <span className="text-muted-foreground">View Weight</span>
                      <span className="text-primary">x1 Point</span>
                   </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
