import { useState, useEffect } from "react";
import { CommandBar } from "./CommandBar";
import { LogOut, Settings as SettingsIcon, LayoutDashboard, Rocket, Users, Target } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getApiData } from "@/lib/api";
import { io } from "socket.io-client";
import { toast } from "sonner";

const mainNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/projects", icon: Rocket },
  { label: "Community", path: "/community", icon: Users },
  { label: "Event", path: "/event", icon: Target, isHighlight: true },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem("user_cache");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_cache");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getApiData("/api/v1/auth/me");
        setUser(data);
        localStorage.setItem("user_cache", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching user in layout:", err);
      }
    };
    fetchUser();
  }, [location.pathname, navigate]);

  // Global socket listener for toasts
  useEffect(() => {
    if (!user) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const socket = io(apiUrl, { transports: ["websocket", "polling"] });
    
    socket.on("connect", () => {
      socket.emit("join_personal", user.id);
    });
    
    socket.on("new_notification", (notif: any) => {
      toast(notif.title, {
        description: notif.body,
        duration: 8000,
        position: "bottom-right",
        action: notif.link ? {
          label: "View",
          onClick: () => navigate(notif.link),
        } : undefined,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>
      
      <CommandBar />

      {/* Clickable futuristic top-left floating brand pill (In the Air) */}
      <div 
        onClick={() => navigate('/dashboard')}
        className="fixed top-4 left-6 z-40 hidden sm:flex items-center gap-3 pl-4 pr-6 py-3 rounded-full border border-border/85 bg-background/80 backdrop-blur-md shadow-md cursor-pointer hover:bg-secondary transition-colors"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 overflow-hidden shrink-0">
          <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
        </div>
        <span className="text-base font-black tracking-widest text-foreground uppercase">STUSIL</span>
      </div>

      {/* Floating profile avatar block at top right (In the Air) */}
      <div className="fixed top-4 right-6 z-40 flex items-center gap-3 px-4.5 py-2 rounded-full border border-border/85 bg-background/80 backdrop-blur-md shadow-sm">
        {user ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/settings')}
              className={`p-2 rounded-full transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/60 ${location.pathname === '/settings' ? 'text-primary' : ''}`}
              title="Settings"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <div 
              onClick={() => navigate('/settings')}
              className="h-9 w-9 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center cursor-pointer shadow-inner ml-1"
            >
              {user.profile_image ? (
                <img src={user.profile_image} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-black text-muted-foreground">{(user.full_name || user.username || "U").substring(0, 1).toUpperCase()}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground px-2 py-1">Log In</Link>
            <Link to="/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-primary/25 hover:opacity-95">Sign Up</Link>
          </div>
        )}
      </div>

      {/* Floating Realistic Futuristic bottom capsule menu - Navigation Only, Sized Bigger (In the Air) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto px-3 py-2 sm:px-5 sm:py-3 rounded-full border border-border bg-background/85 backdrop-blur-xl shadow-[0_15px_45px_-12px_rgba(0,0,0,0.15)] flex items-center justify-center gap-4 transition-all hover:scale-[1.02] hover:shadow-[0_20px_55px_-10px_rgba(0,0,0,0.2)]">
        {/* Navigation items */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-sm font-bold transition-all relative ${
                  isActive
                    ? item.isHighlight
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-secondary text-foreground border border-border/80"
                    : item.isHighlight
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          {(user?.role?.toLowerCase() === 'admin' || user?.email === 'stusil.online@gmail.com') && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-sm font-bold transition-all ${
                location.pathname === "/admin"
                  ? "bg-secondary text-foreground border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <SettingsIcon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full pb-28 pt-8">
        <div className="mx-auto max-w-7xl w-full p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
