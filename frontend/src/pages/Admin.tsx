import { motion } from "framer-motion";
import {
  Users, FolderOpen, Rocket, Shield,
  Ban, Search, Trash2, X, Sparkles, Activity,
  Calendar, Plus, LogOut, ExternalLink, ChevronDown
} from "lucide-react";
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
  const [tab, setTab] = useState<"overview" | "users" | "projects" | "events">("overview");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Event creation form states
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventStatus, setNewEventStatus] = useState<"upcoming" | "completed">("upcoming");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEventDetails, setNewEventDetails] = useState(() => {
    return JSON.stringify({
      headline: "Build Real Solutions. Win Real Recognition.",
      subheadline: "One-week online challenge for high school students to solve community problems with innovation + tech",
      challenge_desc: "STUSIL x POLARIS is a one-week online innovation challenge for high school students across Africa. Pick a real problem in your community → brainstorm → build a solution → submit in 1 week. No coding experience needed. Just curiosity, teamwork, and the drive to make impact.",
      how_it_works_1: "Register - Sign up solo or with a team of 2-4 students",
      how_it_works_2: "Problem Drop - We release real community problem statements on June 14, 9am GMT",
      how_it_works_3: "Build for 1 Week - Ideate, design, prototype. Mentors available in Discord",
      how_it_works_4: "Submit & Get Judged - Submit your pitch deck/video. Winners announced June 24",
      open_to: "High school students aged 13-19 across Africa and world wide",
      format: "Individual or teams of 2-4",
      skills_needed: "None. We’ll provide templates, mentor support, and workshops before D-Day",
      winners_prize: "Certificate + Feature on STUSIL x POLARIS platforms + Mentorship session",
      participants_prize: "Official participation certificate + Access to innovation community",
      top_10_prize: "Special shoutout + Direct intro to youth innovation networks",
      timeline: [
        { date: "June 1 - June 13", event: "Registration open + Pre-challenge workshops" },
        { date: "June 14, 9am GMT", event: "Challenge starts - Problem statements released" },
        { date: "June 21, 9am GMT", event: "Submissions close" },
        { date: "June 24", event: "Winners announced" }
      ],
      what_you_build: "App mockup / Website prototype / Pitch deck / Video explanation / Social campaign. Focus is on problem-solving + clear thinking, not perfect code.",
      mentors_judges: "Learn from young founders, designers, and tech educators who’ve been where you are. Live Q&A + Discord support throughout the 24hrs.",
      faq_1_q: "Is it free?",
      faq_1_a: "Yes, 100% free to join",
      faq_2_q: "Do I need to code?",
      faq_2_a: "No. Ideas + prototypes are welcome",
      faq_3_q: "What if I’ve never done this before?",
      faq_3_a: "Perfect. We’ll teach you as you go",
      faq_4_q: "Can I join from any country?",
      faq_4_a: "Yes, fully online"
    }, null, 2);
  });

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
      const [usersData, projectsData, eventsData] = await Promise.all([
        getApiData("/api/v1/admin/users"),
        getApiData("/api/v1/admin/projects"),
        getApiData("/api/v1/events")
      ]);

      if (usersData) setUsers(usersData);
      if (projectsData) setProjects(projectsData);
      if (eventsData) setEvents(eventsData);
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
      const endpoint = type === 'event' ? `/api/v1/events/${id}` : `/api/v1/admin/${type}s/${id}`;
      const res = await apiFetch(endpoint, {
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
    setShowDeleteConfirm(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate || !newEventDesc) {
      toast.error("Please fill in all event fields");
      return;
    }
    
    let parsedDetails = null;
    try {
      if (newEventDetails) {
        parsedDetails = JSON.parse(newEventDetails);
      }
    } catch (err) {
      toast.error("Detailed Configuration is not a valid JSON object!");
      return;
    }

    setIsCreatingEvent(true);
    try {
      const res = await apiFetch("/api/v1/events", {
        method: "POST",
        body: JSON.stringify({
          title: newEventTitle,
          description: newEventDesc,
          date: newEventDate,
          status: newEventStatus,
          details: parsedDetails
        })
      });
      if (res.ok) {
        toast.success("Event created successfully");
        setNewEventTitle("");
        setNewEventDate("");
        setNewEventDesc("");
        setNewEventStatus("upcoming");
        // Reset to default template
        setNewEventDetails(JSON.stringify({
          headline: "Build Real Solutions. Win Real Recognition.",
          subheadline: "One-week online challenge for high school students to solve community problems with innovation + tech",
          challenge_desc: "STUSIL x POLARIS is a one-week online innovation challenge for high school students across Africa. Pick a real problem in your community → brainstorm → build a solution → submit in 1 week. No coding experience needed. Just curiosity, teamwork, and the drive to make impact.",
          how_it_works_1: "Register - Sign up solo or with a team of 2-4 students",
          how_it_works_2: "Problem Drop - We release real community problem statements on June 14, 9am GMT",
          how_it_works_3: "Build for 1 Week - Ideate, design, prototype. Mentors available in Discord",
          how_it_works_4: "Submit & Get Judged - Submit your pitch deck/video. Winners announced June 24",
          open_to: "High school students aged 13-19 across Africa and world wide",
          format: "Individual or teams of 2-4",
          skills_needed: "None. We’ll provide templates, mentor support, and workshops before D-Day",
          winners_prize: "Certificate + Feature on STUSIL x POLARIS platforms + Mentorship session",
          participants_prize: "Official participation certificate + Access to innovation community",
          top_10_prize: "Special shoutout + Direct intro to youth innovation networks",
          timeline: [
            { date: "June 1 - June 13", event: "Registration open + Pre-challenge workshops" },
            { date: "June 14, 9am GMT", event: "Challenge starts - Problem statements released" },
            { date: "June 21, 9am GMT", event: "Submissions close" },
            { date: "June 24", event: "Winners announced" }
          ],
          what_you_build: "App mockup / Website prototype / Pitch deck / Video explanation / Social campaign. Focus is on problem-solving + clear thinking, not perfect code.",
          mentors_judges: "Learn from young founders, designers, and tech educators who’ve been where you are. Live Q&A + Discord support throughout the 24hrs.",
          faq_1_q: "Is it free?",
          faq_1_a: "Yes, 100% free to join",
          faq_2_q: "Do I need to code?",
          faq_2_a: "No. Ideas + prototypes are welcome",
          faq_3_q: "What if I’ve never done this before?",
          faq_3_a: "Perfect. We’ll teach you as you go",
          faq_4_q: "Can I join from any country?",
          faq_4_a: "Yes, fully online"
        }, null, 2));
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create event");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error("Network error creating event");
    } finally {
      setIsCreatingEvent(false);
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

  const filteredUsers = users.filter((u) => {
    if (u.role?.toLowerCase() === 'admin' || u.email === 'stusil.online@gmail.com') return false;
    const s = search.toLowerCase();
    return (
      (u.name || u.full_name || u.username || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s)
    );
  });

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8 font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <Shield className="h-10 w-10 text-primary animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Verifying Administrative Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden font-sans">
      
      {/* Background Graphic Orbs for Admin (Command Center style) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-500/5 blur-[150px]" />
      </div>

      {/* Admin Specific Custom Header Bar */}
      <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 overflow-hidden shrink-0 shadow-inner">
            <img src="/logo.png" alt="Stusil Logo" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <span className="text-lg font-black tracking-widest text-foreground uppercase">STUSIL OVERHEAD</span>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[9px] font-black uppercase text-primary">ADMIN</span>
          </div>
        </div>

        {/* Clean Admin Action Bar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary/80 border border-border hover:bg-secondary transition-colors shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Return to App
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user_cache");
              toast.success("Logged out from admin successfully");
              navigate("/login");
            }}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" /> Log Out
          </button>
        </div>
      </header>

      {/* Main Administrative Workspace */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 py-10 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <Shield className="h-8 w-8 text-primary relative z-10" />
              </div>
              <div>
                <h1 className="heading-tight text-4xl font-black text-foreground tracking-tighter">Command Center</h1>
                <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Oversight Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-secondary/80 p-1.5 border border-border/80 overflow-x-auto backdrop-blur-md shadow-inner">
              {(["overview", "users", "projects", "events"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t as any); setSearch(""); }}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${
                  tab === t 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
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
                  <div className="bg-card backdrop-blur-xl border border-border/80 rounded-3xl p-6 relative overflow-hidden group hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <div className="absolute -right-10 -top-10 h-32 w-32 bg-secondary/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-start justify-between relative z-10">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg} border border-border/20 shadow-md ${stat.shadow}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</p>
                        <p className="heading-tight text-4xl font-black text-foreground">{stat.value}</p>
                      </div>
                    </div>
                    {/* Simulated Sparkline */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-border/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative overflow-hidden p-6 bg-card backdrop-blur-xl border border-border/80 rounded-3xl shadow-sm hover:border-primary/25 transition-all duration-300">
                <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Platform Growth</h3>
                    <p className="text-xs text-muted-foreground mt-1">Projected user and venture trajectory (last 6 months)</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-secondary/85 px-3 py-1.5 rounded-full border border-border">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Live Telemetry</span>
                  </div>
                </div>
                <div className="h-[300px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProjects)" activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex-1 p-6 bg-card backdrop-blur-xl border border-border/80 rounded-3xl relative overflow-hidden shadow-sm hover:border-primary/25 transition-all duration-300">
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
                </div>

                <div className="p-6 bg-card backdrop-blur-xl border border-border/80 rounded-3xl shadow-sm hover:border-primary/25 transition-all duration-300">
                  <h3 className="text-sm font-bold text-foreground mb-4">Security Context</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 flex items-start gap-3">
                      <Ban className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Anti-Spam Active</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Filtering suspicious requests</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-500 flex items-start gap-3">
                      <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Core Encryption</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">DB connection secured via SSL</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "users" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="p-0 overflow-hidden bg-card backdrop-blur-xl border border-border/80 rounded-3xl shadow-sm">
              <div className="p-4 border-b border-border/60 bg-secondary/10 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 w-full max-w-md backdrop-blur-md shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pioneers by name or email..." className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-secondary/20">
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Activity</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Joined</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredUsers.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="transition-colors hover:bg-secondary/20 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 text-xs font-bold text-primary shadow-inner border border-primary/20">
                              {u.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-foreground">{u.name}</p>
                                {u.is_verified && <Sparkles className="h-3 w-3 text-emerald-500" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            u.role === "Admin" 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "bg-secondary text-muted-foreground border border-border"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{u.projectsCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">{u.joined}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => { setDeleteContext({ type: 'user', id: u.id }); setShowDeleteConfirm(true); }} disabled={u.role === "Admin"} className="rounded-xl p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-30 disabled:hover:bg-transparent focus:outline-none">
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
            </div>
          </motion.div>
        )}

        {tab === "projects" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 w-full max-w-md backdrop-blur-md shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ventures by title or owner..." className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className="p-6 bg-card backdrop-blur-xl border border-border/80 rounded-3xl relative overflow-hidden shadow-sm hover:border-primary/25 transition-all duration-300 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="flex items-start gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-inner border border-emerald-500/10">
                          <FolderOpen className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">{p.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="text-xs font-medium text-muted-foreground bg-secondary border border-border px-2.5 py-1 rounded-md">By {p.owner?.full_name || p.owner?.username}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => { setDeleteContext({ type: 'project', id: p.id }); setShowDeleteConfirm(true); }} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm w-fit focus:outline-none">
                        <Trash2 className="h-4 w-4" /> Terminate
                      </button>
                    </div>

                    {/* Members Section */}
                    {p.members && p.members.length > 0 && (
                      <div className="mt-6 border-t border-border pt-5 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                          <Users className="h-3 w-3" /> Active Crew ({p.members.length})
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {p.members.map((m: any) => (
                            <div key={m.id} className="flex items-center gap-3 bg-secondary/50 rounded-xl px-3 py-2 border border-border hover:border-border/80 transition-colors group/member shadow-sm">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-[10px] font-bold text-primary shadow-inner">
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
                  </div>
                </motion.div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="p-12 text-center text-muted-foreground text-sm font-medium bg-secondary/10 border border-dashed border-border rounded-3xl">No ventures discovered.</div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "events" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Event Creation Form */}
              <div className="p-6 border border-border bg-card backdrop-blur-xl rounded-3xl shadow-sm hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-2 border-b border-border/60 pb-4 mb-6">
                  <Plus className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Create New Event</h3>
                </div>
                
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Title</label>
                    <div className="relative flex items-center">
                      <Rocket className="absolute left-3.5 text-muted-foreground h-4 w-4" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Stusil Summer HackSprint"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full bg-background border border-border hover:border-border/80 focus:border-primary rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Date / Details</label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-3.5 text-muted-foreground h-4 w-4" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. June 14, 2026"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full bg-background border border-border hover:border-border/80 focus:border-primary rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Status</label>
                    <div className="relative flex items-center">
                      <Activity className="absolute left-3.5 text-muted-foreground h-4 w-4" />
                      <select
                        value={newEventStatus}
                        onChange={(e) => setNewEventStatus(e.target.value as any)}
                        className="w-full bg-background border border-border hover:border-border/80 focus:border-primary rounded-xl pl-11 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all appearance-none cursor-pointer"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 pointer-events-none h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description & Context</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Brief summary of the event highlights, registration rules, or tracks."
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      className="w-full bg-background border border-border hover:border-border/80 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Detailed Page Config (JSON)</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Detailed Page Section 1-10 configs in JSON format"
                      value={newEventDetails}
                      onChange={(e) => setNewEventDetails(e.target.value)}
                      className="w-full bg-background border border-border hover:border-border/80 focus:border-primary rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingEvent}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-primary hover:opacity-95 disabled:opacity-50 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    {isCreatingEvent ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Create Event
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Event Directory */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-0 overflow-hidden border border-border/80 bg-card backdrop-blur-xl rounded-3xl shadow-sm">
                  <div className="p-4 border-b border-border/60 bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Events Directory</h3>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    {events.map((ev, i) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 bg-secondary/20 hover:bg-secondary/40 border border-border/60 hover:border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group shadow-sm hover:shadow-md"
                      >
                        <div className="space-y-1.5 max-w-xl text-left">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{ev.title}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              ev.status === 'upcoming'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-secondary text-muted-foreground border-border'
                            }`}>
                              {ev.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-primary" /> {ev.date}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed font-normal">{ev.description}</p>
                        </div>

                        <button
                          onClick={() => {
                            setDeleteContext({ type: 'event', id: ev.id });
                            setShowDeleteConfirm(true);
                          }}
                          className="self-end sm:self-center flex items-center justify-center p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all focus:outline-none"
                          title="Delete event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}

                    {events.length === 0 && (
                      <div className="p-12 text-center text-muted-foreground text-sm font-medium">No events found in the database.</div>
                    )}
                  </div>
                </div>
              </div>

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
    </main>
  </div>
  );
}
