import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { 
  Rocket, Calendar, Users, Trophy, ChevronRight, 
  HelpCircle, MonitorPlay, MessageSquare, Zap, Clock,
  AlertCircle, Sparkles, Send, ExternalLink, Award, ArrowRight, Check
} from "lucide-react";
import { toast } from "sonner";
import { getApiData, apiFetch } from "@/lib/api";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  // Submission workspace tab state
  const [portalTab, setPortalTab] = useState<"submit" | "results">("submit");
  
  // Submission form state with LocalStorage persistence
  const [submission, setSubmission] = useState<any>(() => {
    const cached = localStorage.getItem(`event_sub_${id}`);
    return cached ? JSON.parse(cached) : null;
  });

  const [form, setForm] = useState({
    teamName: "",
    projectName: "",
    category: "High School Track",
    submissionType: "App Mockup",
    demoUrl: "",
    githubUrl: "",
    discordUser: "",
    description: ""
  });

  const [saving, setSaving] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const data = await getApiData(`/api/v1/events/${id}`);
        if (data && !data.error) {
          // Parse details JSON string if present
          if (data.details && typeof data.details === 'string') {
            try {
              data.parsedDetails = JSON.parse(data.details);
            } catch (e) {
              console.error("Error parsing event details JSON:", e);
            }
          }
          setEvent(data);
        } else {
          toast.error("Event not found");
          navigate("/event");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        toast.error("Failed to load event details");
        navigate("/event");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id, navigate]);

  // Countdown timer logic
  useEffect(() => {
    if (!event || event.status === 'completed') {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    let targetTime = new Date("2026-06-14T09:00:00Z").getTime();
    try {
      const parsed = Date.parse(event.date);
      if (!isNaN(parsed)) {
        targetTime = parsed;
      }
    } catch (e) {}

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Event details...</span>
        </div>
      </AppLayout>
    );
  }

  if (!event) return null;

  // Use parsed details, fallback to default Polaris layout structures if empty
  const d = event.parsedDetails || {
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamName || !form.projectName || !form.discordUser || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      // Create mailto link parameters
      const subject = `Pitch Submission: ${form.projectName} - ${form.teamName}`;
      const emailBody = `Team Name: ${form.teamName}
Project Title: ${form.projectName}
Category Track: ${form.category}
Media Format: ${form.submissionType}
Pitch / Demo Link: ${form.demoUrl || "N/A"}
Discord Contact: ${form.discordUser}

Pitch Summary & Solution Description:
${form.description}`;

      const mailtoUrl = `mailto:stusil.online@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Save submission details locally so user sees the submitted status page
      const mockSubmission = {
        ...form,
        submittedAt: new Date().toISOString(),
        status: "Drafted via Email",
        projectId: "email-" + Math.random().toString(36).substring(2, 11)
      };
      setSubmission(mockSubmission);
      localStorage.setItem(`event_sub_${id}`, JSON.stringify(mockSubmission));
      
      toast.success("Opening your email client to send the pitch...");
      
      // Perform redirect to mail client
      window.location.href = mailtoUrl;
    } catch (err) {
      console.error("Error setting up mail redirect:", err);
      toast.error("Failed to prepare pitch submission email.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmission = () => {
    if (submission) {
      setForm({
        teamName: submission.teamName,
        projectName: submission.projectName,
        category: submission.category,
        submissionType: submission.submissionType,
        demoUrl: submission.demoUrl || "",
        githubUrl: submission.githubUrl || "",
        discordUser: submission.discordUser,
        description: submission.description
      });
    }
    setSubmission(null);
    localStorage.removeItem(`event_sub_${id}`);
    toast.info("You can now update your submission.");
  };

  return (
    <AppLayout>
      <div className="w-full flex flex-col gap-16 pb-20 mt-4 relative">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Navigation Breadcrumb */}
        <div className="max-w-5xl mx-auto w-full px-4 relative z-10">
          <Link to="/event" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to Sprints
          </Link>
        </div>

        {/* 1. Hero Section */}
        <section className="relative flex flex-col items-center text-center max-w-4xl mx-auto px-4 mt-2 z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/25 text-primary font-bold text-xs mb-6 uppercase tracking-wider"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" /> {event.title}
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-indigo-500 bg-clip-text text-transparent">
              {d.headline}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-3xl mb-12">
            {d.subheadline}
          </p>

          {/* Countdown timer / visual */}
          <div className="w-full max-w-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-[2.5rem] p-6 md:p-8 shadow-xl mb-12 relative overflow-hidden group hover:border-primary/45 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              
              {event.status === 'upcoming' ? (
                <>
                  <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
                    <span className="text-xs uppercase font-black text-primary tracking-widest flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 animate-pulse" /> SPRINT BEGINS IN
                    </span>
                    <span className="text-sm text-muted-foreground font-bold">Start: {event.date}</span>
                  </div>

                  {/* Countdown numbers */}
                  <div className="flex items-center gap-3">
                    {Object.entries(timeLeft).map(([unit, value]) => (
                      <div key={unit} className="flex flex-col items-center bg-secondary/80 border border-primary/10 rounded-2xl p-3 w-16 md:w-20 shadow-md group-hover:border-primary/20 transition-colors">
                        <span className="text-xl md:text-2xl font-black text-foreground">{value}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary">{unit}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-2">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                    🏆 Event Concluded. Check leaderboard and submitted pitches below.
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="#portal" className="glow-button flex items-center justify-center gap-2 text-md px-8 py-3.5">
              {event.status === 'upcoming' ? 'Register Now' : 'Enter Workspace'} <ChevronRight className="h-5 w-5" />
            </a>
            <a href="#rules" className="glow-button-outline flex items-center justify-center gap-2 text-md px-8 py-3.5">
              Learn How It Works
            </a>
          </div>
        </section>

        {/* 2. What Is This Challenge? */}
        <section id="rules" className="scroll-mt-24 border-t border-border/60 pt-16 max-w-4xl mx-auto w-full px-4">
          <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="max-w-2xl text-left">
              <span className="text-xs uppercase font-black text-primary tracking-widest block mb-2">The Mission</span>
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6">What Is This Challenge?</h2>
              <p className="text-md text-muted-foreground leading-relaxed font-medium whitespace-pre-line">
                {d.challenge_desc}
              </p>
            </div>
          </div>
        </section>

        {/* 3. How It Works - 4 Steps */}
        <section className="max-w-5xl mx-auto w-full px-4 mt-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-black text-primary tracking-widest block mb-2">Step-by-Step</span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[d.how_it_works_1, d.how_it_works_2, d.how_it_works_3, d.how_it_works_4].map((stepText, idx) => {
              const parts = stepText.split(" - ");
              const stepTitle = parts[0] || `Step ${idx + 1}`;
              const stepDesc = parts[1] || "";
              
              return (
                <div key={idx} className="bg-card border border-border/85 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:border-primary/30 transition-colors group">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{stepTitle}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">{stepDesc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Who Can Join */}
        <section className="max-w-4xl mx-auto w-full px-4 mt-8">
          <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8 text-center md:text-left">Who Can Join?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Eligibility</span>
                <h4 className="text-lg font-bold text-foreground">Open To</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{d.open_to}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Team Size</span>
                <h4 className="text-lg font-bold text-foreground">Format</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{d.format}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pre-requisites</span>
                <h4 className="text-lg font-bold text-foreground">Skills Needed</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{d.skills_needed}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Prizes & Recognition */}
        <section className="max-w-4xl mx-auto w-full px-4 mt-8">
          <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 justify-center md:justify-start">
              <Trophy className="text-amber-500 h-7 w-7" /> Prizes & Recognition
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-b from-card to-amber-500/5 border border-amber-500/10 rounded-2xl p-6 hover:border-amber-500/50 transition-all flex flex-col items-center text-center hover:scale-[1.01] shadow-sm">
                <div className="text-4xl mb-4">🥇</div>
                <h4 className="font-bold text-md text-amber-500 mb-2">Winners</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  {d.winners_prize}
                </p>
              </div>

              <div className="bg-gradient-to-b from-card to-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 hover:border-indigo-500/50 transition-all flex flex-col items-center text-center hover:scale-[1.01] shadow-sm">
                <div className="text-4xl mb-4">🌟</div>
                <h4 className="font-bold text-md text-indigo-500 mb-2">Top 10 Teams</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  {d.top_10_prize}
                </p>
              </div>

              <div className="bg-gradient-to-b from-card to-primary/5 border border-primary/10 rounded-2xl p-6 hover:border-primary/50 transition-all flex flex-col items-center text-center hover:scale-[1.01] shadow-sm">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="font-bold text-md text-primary mb-2">All Participants</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  {d.participants_prize}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Timeline */}
        <section className="max-w-4xl mx-auto w-full px-4 mt-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-black text-primary tracking-widest block mb-2">Key Dates</span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Challenge Timeline</h2>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {d.timeline && d.timeline.map((item: any, i: number) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-secondary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/20 transition-all text-left">
                  <div className="font-black text-xs uppercase tracking-widest text-primary mb-1">{item.date}</div>
                  <div className="font-bold text-foreground text-sm">{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. What You’ll Build */}
        <section className="max-w-4xl mx-auto w-full px-4 mt-8">
          <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-12 shadow-sm text-left">
            <span className="text-xs uppercase font-black text-primary tracking-widest block mb-2">Deliverables</span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6">What You’ll Build</h2>
            <p className="text-md text-muted-foreground leading-relaxed font-medium">
              {d.what_you_build}
            </p>
          </div>
        </section>

        {/* 8. Mentors & Judges */}
        <section className="max-w-4xl mx-auto w-full px-4 mt-8">
          <div className="bg-card border border-border/80 rounded-3xl p-8 md:p-12 shadow-sm text-left">
            <span className="text-xs uppercase font-black text-primary tracking-widest block mb-2">Support Network</span>
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-6">Mentors & Judges</h2>
            <p className="text-md text-muted-foreground leading-relaxed font-medium mb-6">
              {d.mentors_judges}
            </p>
            <div className="bg-primary/5 text-primary text-xs p-4 rounded-xl border border-primary/20 leading-relaxed font-bold">
              💬 Dedicated channels inside the Stusil Discord ecosystem will host live mentoring desks with tech founders, designers, and educators.
            </div>
          </div>
        </section>

        {/* 9. FAQ Section */}
        <section className="max-w-3xl mx-auto w-full px-4 mt-8 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4 text-left">
            {[
              { q: d.faq_1_q, a: d.faq_1_a },
              { q: d.faq_2_q, a: d.faq_2_a },
              { q: d.faq_3_q, a: d.faq_3_a },
              { q: d.faq_4_q, a: d.faq_4_a }
            ].map((faq, i) => (
              <div key={i} className="bg-card border border-border/80 rounded-2xl p-6">
                <h4 className="font-bold text-foreground text-md mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" /> {faq.q}
                </h4>
                <p className="text-muted-foreground pl-7 text-xs leading-relaxed font-semibold">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Participant Portal (Submission Form) */}
        <section id="portal" className="scroll-mt-24 max-w-4xl mx-auto w-full px-4 mt-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black">Participant Portal</h2>
            <p className="text-muted-foreground mt-2 font-medium">Access your workspace and submit your project solution.</p>
          </div>

          <div className="flex bg-secondary p-1.5 rounded-2xl border border-border/60 max-w-md mx-auto mb-8">
            <button
              type="button"
              onClick={() => setPortalTab("submit")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                portalTab === "submit"
                  ? "bg-card text-foreground shadow-md border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Rocket className="h-4 w-4" /> Workspace Form
            </button>
            <button
              type="button"
              onClick={() => setPortalTab("results")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                portalTab === "results"
                  ? "bg-card text-foreground shadow-md border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="h-4 w-4" /> Standings
            </button>
          </div>

          <AnimatePresence mode="wait">
            {portalTab === "submit" ? (
              <motion.div
                key="submit-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-card border border-border/80 rounded-3xl p-6 md:p-10 shadow-lg text-left"
              >
                {submission ? (
                  /* Submitted State */
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
                      <Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2">Pitch Details Prepared!</h3>
                    <p className="text-muted-foreground text-sm max-w-md mb-8">
                      Your pitch details have been structured and sent to your email client. Make sure to hit "Send" in your mail app to deliver it to <span className="text-primary font-bold">stusil.online@gmail.com</span>.
                    </p>

                    <div className="w-full max-w-md bg-secondary border border-border/80 rounded-2xl p-6 mb-8 text-left space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-border/80">
                        <span className="text-xs uppercase font-black text-muted-foreground">Status</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                          {submission.status}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">✓</div>
                          <span className="text-sm font-semibold text-foreground">Drafted & Redirected (Ref: {submission.projectId.substring(6, 12)}...)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/20 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500/30 items-center justify-center text-amber-500 text-[10px] font-black">⚙</span>
                          </span>
                          <span className="text-sm font-semibold text-foreground">Awaiting Review via Email</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          const subject = `Pitch Submission: ${submission.projectName} - ${submission.teamName}`;
                          const emailBody = `Team Name: ${submission.teamName}
Project Title: ${submission.projectName}
Category Track: ${submission.category}
Media Format: ${submission.submissionType}
Pitch / Demo Link: ${submission.demoUrl || "N/A"}
Discord Contact: ${submission.discordUser}

Pitch Summary & Solution Description:
${submission.description}`;
                          window.location.href = `mailto:stusil.online@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
                        }}
                        className="glow-button px-6 py-2.5 text-sm"
                      >
                        Resend / Open Mail Again
                      </button>
                      <button
                        onClick={handleEditSubmission}
                        className="glow-button-outline px-6 py-2.5 text-sm"
                      >
                        Update Details
                      </button>
                    </div>
                  </div>
                ) : <div className="text-center py-12">
                    <h3 className="text-xl font-bold mb-2">Submissions Closed</h3>
                    <p className="text-muted-foreground">The submission period for this competition has ended.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Standings Tab */
              <motion.div
                key="results-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-lg text-center"
              >
                <Trophy className="text-amber-500 h-10 w-10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Standings & Results</h3>
                
                {d.winners_list && d.winners_list.length > 0 ? (
                  <div className="mt-8 space-y-4 max-w-lg mx-auto">
                    {d.winners_list.map((winner: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-amber-500/20 shadow-sm hover:border-amber-500/50 transition-all text-left">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 font-black text-lg border border-amber-500/20">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "⭐"}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-0.5">{winner.place}</p>
                            <p className="font-bold text-foreground">{winner.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground text-xs max-w-md mx-auto mb-4 font-semibold">
                      Dynamic evaluations are ongoing. Once entries close, results and scored solutions will be logged directly inside this dashboard.
                    </p>
                    <div className="bg-secondary p-4 rounded-xl text-xs text-muted-foreground inline-block border border-border/60 font-bold">
                      🔔 Winners will be announced on June 24.
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 11. Final CTA Section */}
        <section className="max-w-4xl mx-auto w-full px-4">
          <div className="relative overflow-hidden rounded-3xl bg-primary border border-primary/50 p-12 text-center text-primary-foreground shadow-lg">
            <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-32 bg-black/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to solve a real problem?</h2>
              <p className="text-md text-primary-foreground/80 mb-10 leading-relaxed font-semibold">
                Join 500+ students building the future, one idea at a time.
              </p>
              <a href="#portal" className="bg-background text-foreground hover:bg-background/90 px-8 py-3.5 rounded-xl font-bold text-md transition-all shadow-md hover:shadow-lg inline-block">
                Register Now - It’s Free
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/60 pt-8 mt-8 text-center text-xs text-muted-foreground max-w-4xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold">STUSIL x POLARIS 2025</div>
          <div className="flex items-center gap-6 font-semibold">
            <a href="mailto:stusil.online@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
            <a href="https://www.instagram.com/stusil.community?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="hover:text-foreground transition-colors">Instagram</a>
            <a href="https://discord.com/invite/34bHeUqEG?fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGn1Y3zQ1v3TZ19Rl2YEtWhGF5UNJGFb5vXv5nBWe7NVeNwacGs7MuelP4XG-I_aem_KxcOEfnIRrRTgMD8QkdvxA" className="hover:text-foreground transition-colors">Discord</a>
          </div>
        </footer>

      </div>
    </AppLayout>
  );
}
