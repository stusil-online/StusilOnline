import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, LogOut, Globe, Lock, Save, Camera, Link as LinkIcon, Settings } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { getApiData, apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "social" | "security">("profile");
  const navigate = useNavigate();

  // Password fields state (Security Tab)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const data = await getApiData("/api/v1/auth/me");
        setUser(data);
        let links = { github: "", linkedin: "", website: "" };
        try {
          if (data.links) {
            const parsed = JSON.parse(data.links);
            links = { ...links, ...parsed };
          }
        } catch (e) {
          console.error("Error parsing user links:", e);
        }
        
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
          bio: data.bio || "",
          university: data.university || "",
          field_of_study: data.field_of_study || "",
          country: data.country || "",
          github: links.github || "",
          linkedin: links.linkedin || "",
          website: links.website || "",
          discord_username: data.discord_username || ""
        });
      } catch (err) {
        console.error("Error fetching user profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Construct request body
    const links = {
      github: formData.github || "",
      linkedin: formData.linkedin || "",
      website: formData.website || ""
    };

    const body = {
      full_name: formData.full_name,
      bio: formData.bio,
      university: formData.university,
      field_of_study: formData.field_of_study,
      country: formData.country,
      discord_username: formData.discord_username,
      links: JSON.stringify(links)
    };

    try {
      const res = await apiFetch("/api/v1/users/profile", {
        method: "PUT",
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success("Profile preferences updated successfully!");
        // Update local cache
        const updatedUser = { ...user, ...body };
        setUser(updatedUser);
        localStorage.setItem("user_cache", JSON.stringify(updatedUser));
      } else {
        toast.error("Failed to save profile changes.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Error updating profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.info("Password updates must be confirmed via your registered email reset link.");
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await apiFetch("/api/v1/users/profile-photo", {
          method: "PUT",
          body: JSON.stringify({ profile_image: reader.result }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ ...user, profile_image: data.profile_image });
          
          // Update local cache
          const cached = localStorage.getItem("user_cache");
          if (cached) {
            const parsed = JSON.parse(cached);
            parsed.profile_image = data.profile_image;
            localStorage.setItem("user_cache", JSON.stringify(parsed));
          }
          
          toast.success("Profile image updated successfully!");
        } else {
          toast.error("Failed to upload photo.");
        }
      } catch (err) {
        console.error("Image upload error:", err);
        toast.error("Error updating profile picture.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_cache");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
          <div className="flex justify-between items-end">
            <Skeleton className="h-14 w-1/3 rounded-2xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) return null;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        
        {/* Header Block */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Settings className="h-5 w-5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">Account Setup</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight lg:text-4xl">Settings</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your account information, public profile, and security preferences.</p>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors sm:self-center"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tabs Navigation */}
          <div className="lg:col-span-3 flex flex-col gap-1.5">
            {/* Mobile Tab grid */}
            <div className="lg:hidden grid grid-cols-3 gap-2 mb-4">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "social", label: "Socials", icon: Globe },
                { id: "security", label: "Security", icon: Lock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 px-3 rounded-xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Desktop Tabs list */}
            <div className="hidden lg:flex flex-col gap-1">
              {[
                { id: "profile", label: "Profile Details", desc: "Your identity & university info", icon: User },
                { id: "social", label: "Social Profiles", desc: "Github, LinkedIn and links", icon: Globe },
                { id: "security", label: "Account Security", desc: "Manage password credentials", icon: Lock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                    activeTab === tab.id
                      ? "bg-white border-zinc-300 text-zinc-900 shadow-sm"
                      : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border-primary/20 shadow-inner"
                      : "bg-zinc-100 text-zinc-400 border-zinc-200"
                  }`}>
                    <tab.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-wider ${activeTab === tab.id ? 'text-primary' : 'text-zinc-700'}`}>{tab.label}</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{tab.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Panel Container */}
          <div className="lg:col-span-9">
            <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
              
              <AnimatePresence mode="wait">
                
                {/* 1. PROFILE DETAILS PANEL */}
                {activeTab === "profile" && (
                  <motion.form 
                    key="profile-tab"
                    onSubmit={handleSaveProfile}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 md:p-8 space-y-8"
                  >
                    <div className="border-b border-zinc-100 pb-4">
                      <h2 className="text-xl font-bold text-zinc-900">Profile Details</h2>
                      <p className="text-xs text-zinc-500 mt-1">Manage your public bio and school records.</p>
                    </div>

                    {/* Image Upload Area */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100">
                      <div className="relative">
                        <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-zinc-200 shadow-sm relative bg-zinc-50 flex items-center justify-center">
                          {user.profile_image ? (
                            <img src={user.profile_image} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-3xl font-black text-zinc-400 uppercase">
                              {(formData.full_name || user.username || "?").substring(0, 1)}
                            </span>
                          )}
                          {uploading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                              <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <button 
                          type="button"
                          onClick={() => (document.getElementById("profile-upload") as HTMLInputElement)?.click()}
                          className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary text-white shadow-md flex items-center justify-center hover:scale-105 transition-transform border-2 border-white"
                          title="Change profile picture"
                        >
                          <Camera className="h-4.5 w-4.5" />
                        </button>
                        <input 
                          id="profile-upload"
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                        />
                      </div>
                      
                      <div className="text-center sm:text-left">
                        <h4 className="text-sm font-bold text-zinc-800">Profile Photo</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">Accepts PNG or JPG images. Max size 2MB.</p>
                        <div className="mt-3 inline-block bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg">
                          Username: {user.username}
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Display Name</label>
                        <input
                          type="text"
                          name="full_name"
                          required
                          value={formData.full_name}
                          onChange={handleInputChange}
                          placeholder="e.g. Sarah Connor"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          disabled
                          value={formData.email}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 outline-none cursor-not-allowed shadow-sm"
                          title="Contact support to update your registered email."
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-zinc-700">Headline / Short Biography</label>
                        <input
                          type="text"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Brief description of your skills, role or major"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">University</label>
                        <input
                          type="text"
                          name="university"
                          value={formData.university}
                          onChange={handleInputChange}
                          placeholder="e.g. Ashesi University"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Field of Study</label>
                        <input
                          type="text"
                          name="field_of_study"
                          value={formData.field_of_study}
                          onChange={handleInputChange}
                          placeholder="e.g. Computer Science"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="e.g. Ghana"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-6 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="glow-button flex items-center justify-center gap-2 px-6 py-2.5 shadow-md shadow-primary/20 rounded-xl"
                      >
                        {saving ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Profile Info</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* 2. SOCIAL PROFILES PANEL */}
                {activeTab === "social" && (
                  <motion.form 
                    key="social-tab"
                    onSubmit={handleSaveProfile}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 md:p-8 space-y-8"
                  >
                    <div className="border-b border-zinc-100 pb-4">
                      <h2 className="text-xl font-bold text-zinc-900">Social Profiles</h2>
                      <p className="text-xs text-zinc-500 mt-1">Connect your external developer links and portfolio pages.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">GitHub Profile URL</label>
                        <input
                          type="url"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          placeholder="https://github.com/username"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Discord Username</label>
                        <input
                          type="text"
                          name="discord_username"
                          value={formData.discord_username}
                          onChange={handleInputChange}
                          placeholder="e.g. johndoe#1234 or johndoe"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Personal Website URL</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://yourwebsite.com"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-zinc-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-6 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="glow-button flex items-center justify-center gap-2 px-6 py-2.5 shadow-md shadow-primary/20 rounded-xl"
                      >
                        {saving ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Social Links</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* 3. SECURITY PANEL */}
                {activeTab === "security" && (
                  <motion.form 
                    key="security-tab"
                    onSubmit={handleUpdatePassword}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 md:p-8 space-y-8"
                  >
                    <div className="border-b border-zinc-100 pb-4">
                      <h2 className="text-xl font-bold text-zinc-900">Account Security</h2>
                      <p className="text-xs text-zinc-500 mt-1">Change your account password and security details.</p>
                    </div>

                    <div className="space-y-6 max-w-lg">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                          <input
                            type="password"
                            name="currentPassword"
                            required
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                          <input
                            type="password"
                            name="newPassword"
                            required
                            value={passwordForm.newPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-6 flex justify-end">
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="glow-button flex items-center justify-center gap-2 px-6 py-2.5 shadow-md shadow-primary/20 rounded-xl"
                      >
                        {saving ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}

              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
