import { motion } from "framer-motion";
import {
  Users, FolderOpen, Rocket, Shield,
  Ban, Search, Trash2, X, Sparkles, Activity
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiData, apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';



const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 border border-border/50 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs font-medium">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Admin() {
  const [tab, setTab] = useState<"overview" | "users" | "projects">("overview");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // New states for confirmation modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteContext, setDeleteContext] = useState<{ type: string; id: string } | null>(null);
  const [showMemberRemoveConfirm, setShowMemberRemoveConfirm] = useState(false);
  const [memberContext, setMemberContext] = useState<{ type: "project"; parentId: string; memberId: string } | null>(null);

  const [growthData, setGrowthData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  // Check admin access
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        const me = await getApiData("/api/v1/auth/me");
        if (me && (me.role === 'admin' || me.email === 'stusil.online@gmail.com')) {
          setIsAdmin(true);
        } else {
          navigate("/dashboard");
        }
      } catch { navigate("/login"); }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const [usersData, projectsData] = await Promise.all([
        getApiData("/api/v1/admin/users"),
        getApiData("/api/v1/admin/projects")
      ]);

      if (usersData) setUsers(usersData);
      if (projectsData) setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      const fieldCounts: Record<string, number> = {};
      users.forEach(u => {
        const field = u.field_of_study || 'Other';
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
      
      const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];
      const distData = Object.keys(fieldCounts).map((key, idx) => ({
        name: key,
        value: fieldCounts[key],
        color: colors[idx % colors.length]
      })).sort((a: any, b: any) => b.value - a.value);
      setDistributionData(distData);
    } else {
      setDistributionData([]);
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months = [];
    for(let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({ month: d.getMonth(), year: d.getFullYear(), name: monthNames[d.getMonth()] });
    }

    const gData = last6Months.map(m => {
      const maxDate = new Date(m.year, m.month + 1, 0, 23, 59, 59);
      const uCount = users.filter(u => new Date(u.created_at) <= maxDate).length;
      const pCount = projects.filter(p => new Date(p.created_at) <= maxDate).length;
      return { name: m.name, users: uCount, projects: pCount };
    });
    setGrowthData(gData);

  }, [users, projects]);

  const handleDelete = async (type: string, id: string) => {
    try {
      const res = await apiFetch(`/api/v1/admin/${type}s/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Successfully deleted ${type}`);
        fetchData();
      } else {
        toast.error(`Failed to delete ${type}`);
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      toast.error("An error occurred during deletion");
    }
  };

  const handleRemoveMember = async (type: "project", parentId: string, memberId: string) => {
    try {
      const res = await apiFetch(`/api/v1/admin/${type}s/${parentId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Member removed from group");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove member");
      }
    } catch (err) {
      console.error("Error removing member", err);
      toast.error("Network error removing member");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    (p.owner?.full_name || p.owner?.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Pioneers", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", shadow: "shadow-blue-500/20" },
    { label: "Active Projects", value: projects.length, icon: FolderOpen, color: "text-emerald-500", bg: "bg-emerald-500/10", shadow: "shadow-emerald-500/20" },
    { label: "Total Placements", value: projects.reduce((acc, p) => acc + (p.members?.length || 0), 0), icon: Rocket, color: "text-purple-500", bg: "bg-purple-500/10", shadow: "shadow-purple-500/20" },
    { label: "System Health", value: "100%", icon: Shield, color: "text-rose-500", bg: "bg-rose-500/10", shadow: "shadow-rose-500/20" },
  ];

  if (!isAdmin) return <AppLayout><div className="flex h-screen items-center justify-center p-8 text-muted-foreground animate-pulse font-medium tracking-widest uppercase">Verifying Override Access...</div></AppLayout>;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
              <Shield className="h-8 w-8 text-indigo-400 relative z-10" />
            </div>
            <div>
              <h1 className="heading-tight text-4xl font-black text-foreground tracking-tighter">Command Center</h1>
              <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Oversight Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-secondary/30 p-1.5 border border-border/40 overflow-x-auto backdrop-blur-md">
            {(["overview", "users", "projects"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t as any); setSearch(""); }}
                className={`rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${tab === t ? "bg-gradient-to-r from-primary to-glow-secondary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <GlassCard className="glass-card-hover border-border/40 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 h-32 w-32 bg-foreground/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between relative z-10">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} border border-border/30 shadow-lg ${stat.shadow}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</p>
                        <p className="heading-tight text-4xl font-black text-foreground drop-shadow-sm">{stat.value}</p>
                      </div>
                    </div>
                    {/* Simulated Sparkline */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="lg:col-span-2 relative overflow-hidden p-6 border-border/40">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Platform Growth</h3>
                    <p className="text-xs text-muted-foreground mt-1">Projected user and venture trajectory (last 6 months)</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Live Telemetry</span>
                  </div>
                </div>
                <div className="h-[300px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 6, fill: "#8b5cf6", strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProjects)" activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <div className="flex flex-col gap-6">
                <GlassCard className="flex-1 p-6 border-border/40 relative overflow-hidden">
                  <h3 className="text-sm font-bold text-foreground mb-4 relative z-10">Field Distribution</h3>
                  <div className="h-[180px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 relative z-10">
                    {distributionData.map(d => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[10px] font-medium text-muted-foreground">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6 border-border/40">
                  <h3 className="text-sm font-bold mb-4">Security Context</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 flex items-start gap-3">
                      <Ban className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Anti-Spam Active</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Filtering suspicious requests</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-500 flex items-start gap-3">
                      <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Core Encryption</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">DB connection secured via SSL</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "users" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 w-full max-w-md backdrop-blur-md shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pioneers by name or email..." className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              </div>
            </div>

            <GlassCard className="p-0 overflow-hidden border-border/40">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20 bg-secondary/10">
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Activity</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Joined</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {filteredUsers.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="transition-colors hover:bg-secondary/10 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-glow-secondary/20 text-xs font-bold text-primary shadow-inner border border-primary/10">
                              {u.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-foreground">{u.name}</p>
                                {u.is_verified && <Sparkles className="h-3 w-3 text-emerald-400" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${u.role === "Admin" ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/50 text-muted-foreground"
                            }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground/50" />
                            <span className="font-medium">{u.projectsCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">{u.joined}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setDeleteContext({ type: 'user', id: u.id }); setShowDeleteConfirm(true); }} disabled={u.role === "Admin"} className="rounded-xl p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-30 disabled:hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-destructive/50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-muted-foreground text-sm font-medium">No pioneers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {tab === "projects" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 w-full max-w-md backdrop-blur-md shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ventures by title or owner..." className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="p-6 glass-card-hover group border-border/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-start gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-inner border border-emerald-500/10">
                          <FolderOpen className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors">{p.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md">By {p.owner?.full_name || p.owner?.username}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => { setDeleteContext({ type: 'project', id: p.id }); setShowDeleteConfirm(true); }} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/5 border border-destructive/20 hover:bg-destructive hover:text-white transition-all shadow-sm w-fit focus:outline-none focus:ring-2 focus:ring-destructive/50">
                        <Trash2 className="h-4 w-4" /> Terminate
                      </button>
                    </div>

                    {/* Members Section */}
                    {p.members && p.members.length > 0 && (
                      <div className="mt-6 border-t border-border/20 pt-5 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                          <Users className="h-3 w-3" /> Active Crew ({p.members.length})
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {p.members.map((m: any) => (
                            <div key={m.id} className="flex items-center gap-3 bg-background/50 rounded-xl px-3 py-2 border border-border/30 hover:border-border/60 transition-colors group/member shadow-sm">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-glow-secondary/20 flex items-center justify-center text-[10px] font-bold text-primary shadow-inner">
                                {m.user?.full_name?.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col pr-2">
                                <span className="text-xs font-bold text-foreground leading-none">{m.user?.full_name}</span>
                                <span className="text-[9px] font-medium text-muted-foreground mt-1 capitalize">{m.role}</span>
                              </div>
                              {m.user_id !== p.owner_id && (
                                <button
                                  onClick={() => { setMemberContext({ type: 'project', parentId: p.id, memberId: m.id }); setShowMemberRemoveConfirm(true); }}
                                  className="ml-auto rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover/member:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                  title="Revoke access"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="p-12 text-center text-muted-foreground text-sm font-medium glass-card border-dashed">No ventures discovered.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Branded Confirmation Modals */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => deleteContext && handleDelete(deleteContext.type, deleteContext.id)}
          title={`Secure Override`}
          message={`Are you sure you want to permanently terminate this ${deleteContext?.type}? This action will permanently erase all associated data.`}
          confirmText="Confirm Termination"
          variant="danger"
        />

        <ConfirmationModal
          isOpen={showMemberRemoveConfirm}
          onClose={() => setShowMemberRemoveConfirm(false)}
          onConfirm={() => memberContext && handleRemoveMember(memberContext.type, memberContext.parentId, memberContext.memberId)}
          title={`Revoke Access`}
          message={`Are you sure you want to revoke this pioneer's access to the venture?`}
          confirmText="Revoke Access"
          variant="warning"
        />
      </motion.div>
    </AppLayout>
  );
}
