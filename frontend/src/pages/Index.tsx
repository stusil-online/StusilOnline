import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, TrendingUp, Users, Zap, ArrowUpRight,
  Plus, Search, MessageCircle, FolderOpen, Rocket, Bell, Star,
  BarChart3, Target, BookOpen, Check, ExternalLink, Briefcase, Flame,
} from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { getApiData, apiFetch } from "@/lib/api";

interface NotificationType {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface ActivityItem {
  id: string;
  icon: any;
  label: string;
  time: string;
  color: string;
  link?: string;
}

interface Recommendation {
  id: string;
  title: string;
  type: string;
  match: string;
  link: string;
}

const quickActions = [
  { label: "New Project", icon: Plus, color: "text-primary", path: "/projects" },
  { label: "Find Team", icon: Search, color: "text-glow-secondary", path: "/community" },
  { label: "Explore", icon: Star, color: "text-indigo-500", path: "/explore" },
  { label: "Messages", icon: MessageCircle, color: "text-cyan-500", path: "/messages" },
];

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const fetchAll = async () => {
      try {
        const userData = await getApiData("/api/v1/auth/me");
        if (userData && (userData.role === 'admin' || userData.email === 'stusil.online@gmail.com')) {
          return navigate("/admin");
        }
        setUser(userData);

        const pData = await getApiData("/api/v1/projects");
        setProjectCount(Array.isArray(pData) ? pData.length : 0);

        const cData = await getApiData("/api/v1/connections");
        setConnectionCount(cData.connectedUsers?.length || 0);

        const nData = await getApiData("/api/v1/notifications");
        setNotifications(Array.isArray(nData) ? nData.slice(0, 5) : []); 
        setUnreadCount(Array.isArray(nData) ? nData.filter((n: NotificationType) => !n.is_read).length : 0);
        
        const allProj = await getApiData("/api/v1/projects");
        
        if (Array.isArray(allProj)) {
          // Use recent projects for Activity Feed
          const actItems: ActivityItem[] = allProj.slice(0, 5).map((p: any) => ({
            id: p.id,
            icon: FolderOpen,
            label: `New Venture: ${p.title}`,
            time: timeAgo(p.created_at),
            color: "text-emerald-500 bg-emerald-500/10",
            link: `/projects?project=${p.id}`,
          }));
          setActivity(actItems);
          
          // Set recent updates for Live Alerts fallback
          setRecentUpdates(allProj.slice(0, 4).map(p => ({
            id: `upd-${p.id}`,
            title: "Platform Update",
            body: `${p.owner?.full_name || 'Someone'} launched ${p.title}`,
            link: `/projects?project=${p.id}`,
            created_at: p.created_at
          })));
        }

        const recs: Recommendation[] = [];
        if (Array.isArray(allProj)) {
          for (const p of allProj.slice(0, 15)) {
            const openRoles = (p.roles || []).filter((r: any) => !r.is_filled);
            if (openRoles.length > 0 && p.owner_id !== user?.id) {
              recs.push({
                id: p.id,
                title: p.title,
                type: `Needs: ${openRoles[0].title}`,
                match: `${Math.floor(Math.random() * 20) + 75}% Match`,
                link: `/projects`,
              });
            }
            if (recs.length >= 3) break;
          }
        }
        setRecommendations(recs);
      } catch (error) { console.error("Error", error); }
    };

    fetchAll();
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_API_URL || '', { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => { socket.emit("join_personal", user.id); });
    socket.on("new_notification", (notif: NotificationType) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 5));
      setUnreadCount((prev) => prev + 1);
      setActivity((prev) => [{
        id: notif.id,
        icon: notif.type === "application" ? Briefcase : notif.type === "accepted" ? Check : Bell,
        label: notif.body,
        time: "just now",
        color: notif.type === "accepted" ? "text-cyan-600 bg-cyan-500/10" : "text-primary bg-primary/10",
        link: notif.link || undefined,
      }, ...prev.slice(0, 4)]);
    });
    return () => { socket.disconnect(); };
  }, [user]);

  const markAllRead = async () => {
    try {
      await apiFetch("/api/v1/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  return (
    <AppLayout>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-20 left-10 h-[300px] w-[300px] rounded-full bg-glow-secondary/5 blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 p-1 md:p-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary uppercase shadow-2xl">
                {user?.profile_image ? (
                  <img src={user.profile_image} className="h-full w-full object-cover" />
                ) : (
                  (user?.full_name || user?.username || "U").substring(0, 1)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </div>
            <div>
              <h1 className="heading-tight text-3xl font-black text-foreground tracking-tight lg:text-4xl">
                {user ? (user.full_name?.split('@')[0] || user.username?.split('@')[0]) : "Loading System..."}
              </h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Stay updated, {user ? (user.full_name?.split('@')[0].split(' ')[0] || user.username?.split('@')[0]) : "Innovator"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative">
             <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Rank</p>
                   <p className="text-sm font-black text-foreground">#{user?.rank || 142}</p>
                </div>
                <div className="h-10 w-[2px] bg-border/50 mx-2" />
                <div className="text-right">
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                   <p className="text-sm font-black text-primary">Rising Star</p>
                </div>
                <div className="h-10 w-[2px] bg-border/50 mx-2" />
             </div>

             {/* Interactive Notification Bell */}
             <div className="relative">
               <button
                 onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                 className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-secondary/30 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-95 shadow-lg"
               >
                 <Bell className="h-5 w-5" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg shadow-primary/30 animate-pulse">
                     {unreadCount}
                   </span>
                 )}
               </button>

               <AnimatePresence>
                 {showNotifDropdown && (
                   <>
                     <div className="fixed inset-0 z-30" onClick={() => setShowNotifDropdown(false)} />
                     <motion.div
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-border/50 bg-card/95 p-4 shadow-2xl backdrop-blur-xl z-40"
                     >
                       <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-3">
                         <span className="text-sm font-bold text-foreground">Notifications</span>
                         {unreadCount > 0 && (
                           <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Mark all read</button>
                         )}
                       </div>
                       
                       <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                         {notifications.length > 0 ? (
                           notifications.map((n) => (
                             <div
                               key={n.id}
                               onClick={() => {
                                 if (n.link) {
                                   navigate(n.link);
                                   setShowNotifDropdown(false);
                                 }
                               }}
                               className={`group rounded-xl border p-3 cursor-pointer transition-all hover:border-primary/30 ${
                                 n.is_read ? "border-border/20 bg-secondary/5 opacity-70" : "border-primary/25 bg-primary/5"
                               }`}
                             >
                               <div className="flex items-start gap-2.5">
                                 <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.is_read ? "bg-muted-foreground/30" : "bg-primary shadow-lg shadow-primary/20 animate-pulse"}`} />
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center justify-between mb-0.5">
                                     <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{n.title}</p>
                                     <p className="text-[9px] font-bold text-muted-foreground uppercase">{timeAgo(n.created_at)}</p>
                                   </div>
                                   <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-snug">{n.body}</p>
                                 </div>
                               </div>
                             </div>
                           ))
                         ) : (
                           <div className="py-6 text-center text-xs font-semibold text-muted-foreground">
                             You're all caught up!
                           </div>
                         )}
                       </div>
                       
                       <div className="border-t border-border/30 pt-3 mt-3">
                         <button
                           onClick={() => { navigate('/connections'); setShowNotifDropdown(false); }}
                           className="w-full text-center text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:underline"
                         >
                           View Connections Hub
                         </button>
                       </div>
                     </motion.div>
                   </>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
            <GlassCard className="relative overflow-hidden border border-glow-secondary/40 ring-1 ring-glow-secondary/10 shadow-[0_0_15px_rgba(14,165,233,0.08)] h-full">
              <div className="absolute -right-6 -bottom-6 h-20 w-20 bg-glow-secondary/10 blur-[40px] rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Active Ventures</p>
                  <p className="heading-tight mt-2 text-5xl font-black text-foreground">{projectCount}</p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <FolderOpen className="h-3 w-3 text-glow-secondary" />
                    <span className="text-[10px] font-bold text-glow-secondary uppercase tracking-widest">Live in Ecosystem</span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-glow-secondary/5 border border-glow-secondary/20 flex items-center justify-center text-glow-secondary">
                  <Rocket className="h-8 w-8" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="md:col-span-2">
            <GlassCard className="relative overflow-hidden border border-indigo-500/40 ring-1 ring-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.08)] h-full">
              <div className="absolute -right-6 -bottom-6 h-20 w-20 bg-indigo-500/10 blur-[40px] rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Founding Network</p>
                  <p className="heading-tight mt-2 text-5xl font-black text-foreground">{connectionCount}</p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Collective Power</span>
                  </div>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Flame className="h-8 w-8" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-1">
            <GlassCard className="border border-primary/25 ring-1 ring-primary/10 shadow-[0_0_15px_rgba(37,99,235,0.08)] h-full">
              <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Hub Access</p>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="group flex items-center justify-between rounded-xl border border-primary/15 ring-1 ring-primary/5 bg-white/30 backdrop-blur-md p-4 transition-all hover:border-primary/45 hover:bg-white/50 hover:translate-x-1 duration-300 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/50 group-hover:bg-primary/10 transition-colors`}>
                        <action.icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{action.label}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="md:col-span-3">
            <GlassCard className="border border-primary/25 ring-1 ring-primary/10 shadow-[0_0_15px_rgba(37,99,235,0.08)] h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Smart Recommendations</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Tailored for your stack and interests</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.length > 0 ? recommendations.map((rec) => (
                  <div key={rec.id} onClick={() => navigate(rec.link)} className="group relative rounded-2xl border border-primary/15 ring-1 ring-primary/5 bg-white/30 backdrop-blur-md p-5 pr-12 transition-all hover:border-primary/45 hover:bg-white/50 cursor-pointer shadow-sm">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-lg shadow-primary/5">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{rec.title}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">{rec.type}</p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary border border-primary/20">
                       {rec.match}
                    </div>
                    <ArrowUpRight className="absolute top-5 right-5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                )) : (
                  <div className="col-span-full py-10 text-center border-2 border-dashed border-border/20 rounded-3xl text-muted-foreground flex flex-col items-center gap-3">
                    <Zap className="h-10 w-10 text-primary/30" />
                    <p className="text-sm font-medium">Build your profile to unlock smarter recommendations</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2">
            <GlassCard className="border border-primary/25 ring-1 ring-primary/10 shadow-[0_0_15px_rgba(37,99,235,0.08)] h-full">
               <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-foreground">Activity Feed</h3>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {activity.length > 0 ? activity.map((act, i) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={() => act.link && navigate(act.link)}
                      className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-primary/15 hover:translate-x-1 cursor-pointer"
                    >
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg shadow-black/5 ${act.color}`}>
                        <act.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{act.label}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{act.time}</p>
                      </div>
                      {act.link && <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                    </motion.div>
                  )) : (
                    <div className="py-10 text-center text-muted-foreground text-xs font-medium border border-dashed border-border/20 rounded-2xl">
                      Your feed is quiet. Start something big!
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2">
            <GlassCard className="border border-primary/25 ring-1 ring-primary/10 shadow-[0_0_15px_rgba(37,99,235,0.08)] h-full overflow-hidden relative">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-[50px] rounded-full" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Live Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg shadow-primary/20 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">Flush All</button>
                  )}
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-3 relative z-10">
                <AnimatePresence>
                  {notifications.length > 0 ? notifications.slice(0, 4).map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => n.link && navigate(n.link)}
                      className={`group flex items-center gap-3 rounded-2xl border cursor-pointer transition-all hover:border-primary/55 hover:bg-white/30 backdrop-blur-sm p-4 ${
                        n.is_read ? "border-primary/10 bg-white/20 opacity-70" : "border-primary/25 bg-primary/5 shadow-inner"
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${n.is_read ? "bg-muted-foreground/30" : "bg-primary shadow-lg shadow-primary/20"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black text-foreground uppercase tracking-tight">{n.title}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">{timeAgo(n.created_at)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors font-medium">{n.body}</p>
                      </div>
                    </motion.div>
                  )) : recentUpdates.length > 0 ? recentUpdates.map((u) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => u.link && navigate(u.link)}
                      className="group flex items-center gap-3 rounded-2xl border cursor-pointer transition-all hover:border-primary/55 hover:bg-white/30 backdrop-blur-sm p-4 border-primary/10 bg-white/20 opacity-70"
                    >
                      <div className="h-2 w-2 rounded-full flex-shrink-0 bg-emerald-500/50" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black text-foreground uppercase tracking-tight">{u.title}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">{timeAgo(u.created_at)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors font-medium">{u.body}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="py-10 text-center text-muted-foreground text-xs font-medium border border-dashed border-border/20 rounded-2xl">
                      Zero alerts. You're all caught up!
                    </div>
                  )}
                </AnimatePresence>
                 {notifications.length > 4 && (
                   <button onClick={() => navigate('/notifications')} className="w-full py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mt-2">
                     View All Alerts
                   </button>
                 )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Index;
