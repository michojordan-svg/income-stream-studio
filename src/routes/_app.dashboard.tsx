import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, Plus, TrendingUp, MousePointerClick, Target, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { niches, recentActivity, revenueSeries, topPerformers } from "@/lib/dashboard-data";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — Income Autopilot" },
      { name: "description", content: "Overview of your automated income streams for the month." },
    ],
  }),
});

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const kpis = [
  { label: "Total revenue", value: "$2,850.75", change: 14.2, up: true, icon: TrendingUp, hint: "vs $2,496 last month" },
  { label: "Clicks today", value: "247", change: 8.4, up: true, icon: MousePointerClick, hint: "3,842 this month" },
  { label: "Conversions", value: "38", change: -2.1, up: false, icon: Target, hint: "1.6% conv. rate" },
  { label: "Posts scheduled", value: "15", change: 0, up: true, icon: CalendarClock, hint: "Next: 2:30 pm" },
];

function Dashboard() {
  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Overview · July 2026"
        title={`${greeting()}, Alex.`}
        description="Your automation is running quietly in the background. Here's what happened while you slept."
        actions={
          <>
            <button className="hidden h-10 items-center gap-2 rounded-md border border-border bg-card px-3.5 text-sm font-medium text-navy transition hover:bg-cream-soft sm:inline-flex">
              <CalendarClock className="h-4 w-4" /> Last 30 days
            </button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> New content
            </button>
          </>
        }
      />

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fade-up hover-lift group relative overflow-hidden rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-[12px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary-soft text-primary">
                <k.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 font-display text-[30px] font-semibold leading-none text-navy">{k.value}</p>
            <div className="mt-3 flex items-center justify-between">
              <span
                className={
                  "inline-flex items-center gap-1 text-[12px] font-medium " +
                  (k.change === 0 ? "text-muted-foreground" : k.up ? "text-success" : "text-error")
                }
              >
                {k.change !== 0 && (k.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />)}
                {k.change === 0 ? "on schedule" : `${k.up ? "+" : ""}${k.change}%`}
              </span>
              <span className="text-[11px] text-muted-foreground">{k.hint}</span>
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-soft/60 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
        ))}
      </section>

      {/* Revenue chart + niches */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Revenue trend</p>
              <h2 className="mt-1 text-lg font-semibold text-navy">Last 30 days</h2>
            </div>
            <div className="flex gap-1 rounded-md border border-border bg-cream-soft p-1 text-xs">
              {["7d", "30d", "90d"].map((r, i) => (
                <button
                  key={r}
                  className={
                    "rounded px-2.5 py-1 font-medium transition " +
                    (i === 1 ? "bg-card text-navy shadow-subtle" : "text-muted-foreground hover:text-navy")
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2c5aa0" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2c5aa0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f5efe7" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  cursor={{ stroke: "#4a7bc4", strokeDasharray: 4 }}
                  contentStyle={{
                    background: "#1b3a6f",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                    padding: "8px 10px",
                  }}
                  labelStyle={{ color: "#a9c1e6", fontSize: 11, marginBottom: 4 }}
                  formatter={(v: number) => [`$${v}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2c5aa0" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Performance by niche</p>
          {niches.map((n, i) => (
            <div
              key={n.id}
              style={{ animationDelay: `${i * 80}ms`, borderLeftColor: n.color, backgroundColor: n.soft }}
              className="animate-fade-up hover-lift grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border border-l-[3px] p-4"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-navy">{n.name}</p>
                <p className="mt-1 font-display text-xl font-semibold" style={{ color: n.color }}>
                  ${n.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="mt-0.5 text-[11px] text-success">+{n.growth}% this month</p>
              </div>
              <div className="w-24 shrink-0">
                <Sparkline data={n.spark} color={n.color} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top performers */}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Top performers</p>
            <h2 className="mt-1 text-lg font-semibold text-navy">What's earning this month</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <PerfCard title="Pinterest pins" tint="#e8f0f9" tone="#2c5aa0">
            {topPerformers.pins.map((p) => (
              <PerfRow key={p.title} title={p.title} tag={p.niche} left={`${p.clicks.toLocaleString()} clicks`} right={`$${p.revenue}`} />
            ))}
          </PerfCard>
          <PerfCard title="YouTube videos" tint="#fef2f2" tone="#dc3545">
            {topPerformers.videos.map((p) => (
              <PerfRow key={p.title} title={p.title} tag={p.niche} left={`${(p.views / 1000).toFixed(1)}k views`} right={`$${p.revenue}`} />
            ))}
          </PerfCard>
          <PerfCard title="Digital products" tint="#ecfdf5" tone="#10b981">
            {topPerformers.products.map((p) => (
              <PerfRow key={p.title} title={p.title} tag={p.type} left={`${p.sales} sales`} right={`$${p.revenue}`} />
            ))}
          </PerfCard>
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Live feed</p>
            <h2 className="mt-1 text-lg font-semibold text-navy">Recent activity</h2>
          </div>
          <button className="text-xs font-medium text-primary hover:text-primary-hover">View all →</button>
        </div>
        <div className="rounded-xl border border-border bg-card">
          {recentActivity.map((a, i) => (
            <div
              key={i}
              className={
                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 " +
                (i !== recentActivity.length - 1 ? "border-b border-border-soft" : "")
              }
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
              <p className="truncate text-sm text-navy">{a.label}</p>
              <p className="whitespace-nowrap text-[11px] text-muted-foreground">{a.meta}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PerfCard({
  title,
  tint,
  tone,
  children,
}: {
  title: string;
  tint: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div
        className="flex items-center justify-between rounded-t-xl px-4 py-3"
        style={{ backgroundColor: tint }}
      >
        <span className="text-[13px] font-semibold" style={{ color: tone }}>{title}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone }} />
      </div>
      <div>{children}</div>
    </div>
  );
}

function PerfRow({ title, tag, left, right }: { title: string; tag: string; left: string; right: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border-soft px-4 py-3.5 first:border-t-0">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-navy">{title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          <span className="font-mono uppercase tracking-wider">{tag}</span> · {left}
        </p>
      </div>
      <p className="font-display text-[15px] font-semibold text-navy">{right}</p>
    </div>
  );
}
