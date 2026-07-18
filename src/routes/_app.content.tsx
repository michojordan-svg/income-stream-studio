import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { contentLibrary } from "@/lib/dashboard-data";

export const Route = createFileRoute("/_app/content")({
  component: ContentPage,
  head: () => ({ meta: [{ title: "Content library — Income Autopilot" }] }),
});

const niches = ["All", "Health", "Luxury", "AI"];

function ContentPage() {
  const [niche, setNiche] = useState("All");
  const [q, setQ] = useState("");

  const items = useMemo(
    () =>
      contentLibrary.filter(
        (c) => (niche === "All" || c.niche === niche) && (!q || c.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [niche, q],
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={`${contentLibrary.length} pieces · 3 niches`}
        title="Content library"
        description="Every pin, video and post you've queued for automation, in one place."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> New content
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-md border border-border bg-cream-soft p-1">
          {niches.map((n) => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={
                "rounded px-3 py-1.5 text-xs font-medium transition " +
                (niche === n ? "bg-card text-navy shadow-subtle" : "text-muted-foreground hover:text-navy")
              }
            >
              {n}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles…"
            className="h-10 w-full rounded-md border border-border bg-cream-soft pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary-soft"
          />
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-navy hover:bg-cream-soft">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c, i) => (
          <article
            key={c.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className="animate-fade-up hover-lift group overflow-hidden rounded-xl border border-border bg-card"
          >
            <div
              className="relative aspect-[16/10] w-full overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(${c.hue} 42% 78%), hsl(${c.hue} 48% 62%))`,
              }}
            >
              <div className="absolute inset-0 grid-lines opacity-20" />
              <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-navy backdrop-blur">
                {c.platform}
              </span>
              <span
                className={
                  "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold " +
                  (c.status === "Published"
                    ? "bg-success/15 text-success"
                    : c.status === "Scheduled"
                    ? "bg-primary-soft text-primary"
                    : "bg-cream-warm text-muted-foreground")
                }
              >
                {c.status}
              </span>
            </div>
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.niche} · {c.date}</p>
              <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold text-navy">{c.title}</h3>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-soft pt-3 text-center">
                <Stat label="Views" value={c.views ? c.views.toLocaleString() : "—"} />
                <Stat label="Clicks" value={c.clicks ? c.clicks.toLocaleString() : "—"} />
                <Stat label="Conv." value={c.conversions ? String(c.conversions) : "—"} />
              </div>
              <div className="mt-3 flex items-center justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button className="text-xs font-medium text-primary hover:text-primary-hover">View stats →</button>
                <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-cream-soft hover:text-navy">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-cream-soft/60 py-16 text-center">
          <p className="text-sm font-medium text-navy">No content matches this filter.</p>
          <p className="mt-1 text-xs text-muted-foreground">Try clearing the search or picking a different niche.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-sm font-semibold text-navy">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
