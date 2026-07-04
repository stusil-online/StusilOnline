import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Calendar, Clock, ArrowRight, Sparkles, Trophy } from "lucide-react";
import { getApiData } from "@/lib/api";

export default function Event() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getApiData("/api/v1/events");
        if (Array.isArray(data)) {
          setEvents(data);
        }
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);
  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-12 pb-20 mt-4 relative">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Events Directory Header */}
        <section className="text-center max-w-3xl mx-auto mt-8 px-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/25 text-primary font-extrabold text-xs mb-6 uppercase tracking-wider shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" /> Stusil Sprints & Sagas
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-indigo-500 bg-clip-text text-transparent">
              Ecosystem Sprints
            </span>
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-base font-semibold max-w-xl mx-auto leading-relaxed">
            Discover active hackathons, launch community solution models, and win recognition from youth networks worldwide.
          </p>
        </section>

        {loading ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Sprints...</span>
          </div>
        ) : (
          /* Directory Column Layout */
          <section className="max-w-2xl mx-auto w-full px-4 relative z-10 space-y-16">
            
            {/* UPCOMING */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2.5 px-1 border-l-2 border-primary pl-3 tracking-tight">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" /> Upcoming events or Competition
              </h2>
              
              <div className="space-y-6">
                {events.filter(e => e.status === 'upcoming').map((ev) => (
                  <Link 
                    key={ev.id}
                    to={`/event/${ev.id}`}
                    className="block p-8 rounded-[2.5rem] border border-primary/20 bg-card hover:border-primary/60 hover:bg-secondary/30 text-left transition-all hover:scale-[1.02] shadow-lg shadow-black/[0.02] hover:shadow-primary/5 relative overflow-hidden group"
                  >
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                    
                    <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                      <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/25 tracking-widest flex items-center gap-1.5 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Upcoming Sprint
                      </span>
                      <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 bg-secondary/80 px-3 py-1 rounded-full border border-border/40">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {ev.date}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-xl md:text-2xl text-foreground mb-3 group-hover:text-primary transition-colors tracking-tight leading-tight">
                      {ev.title}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6 font-medium pr-4">
                      {ev.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                      <span>View details & Prepare</span> <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
                
                {events.filter(e => e.status === 'upcoming').length === 0 && (
                  <div className="p-12 text-center text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-[2rem] font-medium bg-card/50">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground/45" />
                    No upcoming sprints scheduled. Check back later!
                  </div>
                )}
              </div>
            </div>

            {/* ONGOING */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2.5 px-1 border-l-2 border-emerald-500 pl-3 tracking-tight">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Ongoing events or Competition
              </h2>
              
              <div className="space-y-6">
                {events.filter(e => e.status === 'ongoing').map((ev) => (
                  <Link 
                    key={ev.id}
                    to={`/event/${ev.id}`}
                    className="block p-8 rounded-[2.5rem] border border-emerald-500/20 bg-card hover:border-emerald-500/60 hover:bg-emerald-500/5 text-left transition-all hover:scale-[1.02] shadow-lg shadow-black/[0.02] hover:shadow-emerald-500/5 relative overflow-hidden group"
                  >
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                    
                    <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                      <span className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 tracking-widest flex items-center gap-1.5 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sprint
                      </span>
                      <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 bg-secondary/80 px-3 py-1 rounded-full border border-border/40">
                        <Clock className="h-3.5 w-3.5 text-emerald-500" /> {ev.date}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-xl md:text-2xl text-foreground mb-3 group-hover:text-emerald-500 transition-colors tracking-tight leading-tight">
                      {ev.title}
                    </h3>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6 font-medium pr-4">
                      {ev.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
                      <span>Enter Workspace & Draft Submission</span> <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
                
                {events.filter(e => e.status === 'ongoing').length === 0 && (
                  <div className="p-12 text-center text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-[2rem] font-medium bg-card/50">
                    <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/45" />
                    No events currently in progress.
                  </div>
                )}
              </div>
            </div>

            {/* ENDED */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2.5 px-1 border-l-2 border-muted-foreground pl-3 tracking-tight">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" /> Ended Events or Competition
              </h2>
              
              <div className="space-y-6">
                {events.filter(e => e.status === 'completed' || e.status === 'ended').map((ev) => (
                  <Link 
                    key={ev.id}
                    to={`/event/${ev.id}`}
                    className="block p-8 rounded-[2.5rem] border border-border/50 bg-secondary/10 hover:border-border hover:bg-secondary/30 text-left transition-all hover:scale-[1.02] relative overflow-hidden group opacity-80 hover:opacity-100"
                  >
                    <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                      <span className="text-[10px] font-black text-muted-foreground uppercase bg-secondary px-3 py-1 rounded-full border border-border/50 tracking-widest flex items-center gap-1.5 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Ended
                      </span>
                      <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 bg-secondary/80 px-3 py-1 rounded-full border border-border/40">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {ev.date}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-xl md:text-2xl text-foreground mb-4 transition-colors tracking-tight leading-tight">
                      {ev.title}
                    </h3>
                    
                    {ev.details?.winners_list && ev.details.winners_list.length > 0 ? (
                      <div className="space-y-3 mt-4 pt-4 border-t border-border/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Hall of Fame</p>
                        <div className="grid gap-2">
                          {ev.details.winners_list.map((winner: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
                              <span className="text-xs font-black text-foreground">{winner.place}</span>
                              <span className="text-xs font-medium text-muted-foreground">{winner.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground font-medium italic mt-2">
                        Winners to be announced
                      </p>
                    )}
                  </Link>
                ))}
                
                {events.filter(e => e.status === 'completed' || e.status === 'ended').length === 0 && (
                  <div className="p-12 text-center text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-[2rem] font-medium bg-card/50">
                    <Trophy className="h-8 w-8 mx-auto mb-3 text-muted-foreground/45" />
                    No past events to show yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
