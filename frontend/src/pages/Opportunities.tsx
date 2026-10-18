import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { apiFetch } from "@/lib/api";
import { ArrowUpRight, Award, CalendarDays, Globe, Laptop, RefreshCw } from "lucide-react";

type Opportunity = {
  id: string;
  title: string;
  deadline: string;
  category: string;
  link: string;
  eligibility_notes: string | null;
  student_level: string;
  is_remote: boolean;
  is_global: boolean;
};

const categories = ["scholarship", "internship", "competition", "fellowship", "grant", "program", "other"];
const levels = ["high_school", "undergraduate", "graduate"];
const formatLabel = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [remote, setRemote] = useState(false);
  const [global, setGlobal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let current = true;
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (level) params.set("level", level);
    if (remote) params.set("remote", "true");
    if (global) params.set("global", "true");
    const query = params.toString();

    setLoading(true);
    setError("");
    apiFetch(`/api/v1/opportunities${query ? `?${query}` : ""}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load opportunities");
        if (current) setOpportunities(body);
      })
      .catch((err: Error) => {
        if (current) setError(err.message || "Unable to load opportunities");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => { current = false; };
  }, [category, level, remote, global, refreshCount]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <header className="border-b border-border pb-7 pt-2">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <Award className="h-4 w-4" /> Student opportunities
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Find your next opening</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Scholarships, internships, challenges, and programs with deadlines that are still open.</p>
        </header>

        <section aria-label="Filter opportunities" className="grid gap-4 border-b border-border pb-6 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
              <option value="">All categories</option>
              {categories.map((value) => <option key={value} value={value}>{formatLabel(value)}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">
            Student level
            <select value={level} onChange={(event) => setLevel(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
              <option value="">All levels</option>
              {levels.map((value) => <option key={value} value={value}>{formatLabel(value)}</option>)}
            </select>
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" checked={remote} onChange={(event) => setRemote(event.target.checked)} className="h-4 w-4 accent-primary" />
            Remote only
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" checked={global} onChange={(event) => setGlobal(event.target.checked)} className="h-4 w-4 accent-primary" />
            Open globally
          </label>
        </section>

        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading open opportunities...</div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button onClick={() => setRefreshCount((count) => count + 1)} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-secondary">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : opportunities.length ? (
          <section aria-label="Open opportunities" className="divide-y divide-border">
            {opportunities.map((opportunity) => (
              <article key={opportunity.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-primary">
                    <span>{formatLabel(opportunity.category)}</span>
                    <span className="text-border">/</span>
                    <span>{formatLabel(opportunity.student_level)}</span>
                  </div>
                  <h2 className="text-xl font-bold leading-snug">{opportunity.title}</h2>
                  {opportunity.eligibility_notes && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{opportunity.eligibility_notes}</p>}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Deadline {new Date(opportunity.deadline).toLocaleDateString(undefined, { timeZone: "UTC" })}</span>
                    {opportunity.is_remote && <span className="inline-flex items-center gap-1.5"><Laptop className="h-4 w-4" /> Remote</span>}
                    {opportunity.is_global && <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4" /> Global</span>}
                  </div>
                </div>
                <a href={opportunity.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  View opportunity <ArrowUpRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </section>
        ) : (
          <div className="py-20 text-center">
            <p className="font-semibold">No open opportunities match these filters.</p>
            <button onClick={() => { setCategory(""); setLevel(""); setRemote(false); setGlobal(false); }} className="mt-3 text-sm font-semibold text-primary hover:underline">Clear filters</button>
          </div>
        )}
        <div className="border-t border-border pt-5 text-xs text-muted-foreground">
          <Link to="/login" className="hover:text-primary">Sign in</Link> to explore the Stusil community.
        </div>
      </div>
    </AppLayout>
  );
}