import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDashboard, useAnalyticsSummary } from "@/hooks/useApi";
import { revenueSeries as staticSeries, niches as staticNiches } from "@/lib/dashboard-data";

export const Route = createFileRoute("/_app/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics — Income Autopilot" }] }),
});

function Analytics() {
  const { data: dash } = useDashboard("30days");
  const { data: summary } = useAnalyticsSummary();

  const s = dash?.summary;
  const af = summary?.affiliate;

  const kpis = [
    { label: "Revenue",      value: s ? `$${parseFloat(String(s.total_revenue)).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—", change: "" },
    { label: "Total clicks", value: s ? s.total_clicks.toLocaleString() : "—", change: "" },
    { label: "Conversions",  value: s ? String(s.total_conversions) : "—", change: "" },
    { label: "Conv. rate",   value: s ? `${s.conversion_rate}%` : "—", change: "" },
  ];

  // Chart trends
  const trends = dash?.trends ?? [];
  const chartData = trends.length
    ? trends.map((t) => ({
        day:       new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pinterest: parseFloat(t.revenue) * 0.45,
        youtube:   parseFloat(t.revenue) * 0.33,
        products:  parseFloat(t.revenue) * 0.22,
      }))
    : staticSeries;

  // Platform breakdown from API
  const byPlatform = dash?.by_platform ?? [];
  const platforms = byPlatform.length
    ? byPlatform.slice(0, 3).map((p, i) => ({
        name: p.platform ?? `Platform ${i + 1}`,
        revenue:     parseFloat(p.revenue),
        clicks:      parseInt(p.clicks),
        conversions: parseInt(p.conversions),
        tint: ["#e8f0f9", "#fef2f2", "#ecfdf5"][i],
        tone: ["#2c5aa0", "#dc3545", "#10b981"][i],
      }))
    : [
        { name: "Pinterest", revenue: 1284, clicks: 21400, conversions: 342, tint: "#e8f0f9", tone: "#2c5aa0" },
        { name: "YouTube",   revenue: 946,  clicks: 12600, conversions: 178, tint: "#fef2f2", tone: "#dc3545" },
        { name: "Products",  revenue: 620,  clicks: 4412,  conversions: 92,  tint: "#ecfdf5", tone: "#10b981" },
      ];

  // Niche bar chart
  const byNiche = dash?.by_niche ?? [];
  const nicheBarData = byNiche.filter((n) => n.niche).length
    ? byNiche.filter((n) => n.niche).map((n, i) => ({
        name: n.niche, revenue: parseFloat(n.revenue),
        color: staticNiches[i % staticNiches.length]?.color ?? "#2c5aa0",
      }))
    : staticNiches.map((n) => ({ name: n.name, revenue: n.revenue, color: n.color }));

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Where your money actually comes from, updated every fifteen minutes."
        actions={
          <>
            <div className="flex gap-1 rounded-md border border-border bg-cream-soft p-1 text-xs">
              {["7d", "30d", "90d", "All"].map((r, i) => (
                <button key={r} className={"rounded px-2.5 py-1 font-medium transition " + (i === 1 ? "bg-card text-navy shadow-subtle" : "text-muted-foreground hover:text-navy")}>
                  {r}
                </button>
              ))}
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3.5 text-sm font-medium text-navy hover:bg-cream-soft">
              <Download className="h-4 w-4" /> Export
            </button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-up rounded-xl border border-border bg-card p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
            <p className="mt-3 font-display text-2xl font-semibold text-navy sm:text-[26px]">{k.value}</p>
            {k.change && <p className="mt-1 text-[12px] font-medium text-success">{k.change}</p>}
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Revenue by source</p>
            <h2 className="mt-1 text-lg font-semibold text-navy">30-day breakdown</h2>
          </div>
          <div className="hidden gap-4 text-[11px] sm:flex">
            <Legend color="#2c5aa0" label="Pinterest" />
            <Legend color="#dc3545" label="YouTube" />
            <Legend color="#10b981" label="Products" />
          </div>
        </div>
        <div className="mt-5 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs>
                {[["a1","#2c5aa0"],["a2","#dc3545"],["a3","#10b981"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#f5efe7" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: "#1b3a6f", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} labelStyle={{ color: "#a9c1e6", fontSize: 11 }} />
              <Area type="monotone" dataKey="pinterest" stackId="1" stroke="#2c5aa0" strokeWidth={1.8} fill="url(#a1)" />
              <Area type="monotone" dataKey="youtube"   stackId="1" stroke="#dc3545" strokeWidth={1.8} fill="url(#a2)" />
              <Area type="monotone" dataKey="products"  stackId="1" stroke="#10b981" strokeWidth={1.8} fill="url(#a3)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {platforms.map((p, i) => (
          <div key={p.name} style={{ animationDelay: `${i * 80}ms`, backgroundColor: p.tint, borderColor: `${p.tone}30` }} className="animate-fade-up hover-lift rounded-xl border-2 p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: p.tone }}>{p.name}</p>
            <p className="mt-3 font-display text-3xl font-semibold" style={{ color: p.tone }}>${p.revenue.toLocaleString()}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: `${p.tone}25` }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clicks</p>
                <p className="mt-0.5 text-sm font-semibold text-navy">{p.clicks.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conversions</p>
                <p className="mt-0.5 text-sm font-semibold text-navy">{p.conversions}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Niche performance</p>
            <h2 className="mt-1 text-lg font-semibold text-navy">Where the growth is</h2>
          </div>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nicheBarData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#f5efe7" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip cursor={{ fill: "#fff8f0" }} contentStyle={{ background: "#1b3a6f", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="#2c5aa0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {af && (
        <section className="mt-6 grid grid-cols-3 gap-3">
          {[
            { l: "Affiliate revenue",    v: `$${parseFloat(af.affiliate_revenue).toFixed(2)}` },
            { l: "Affiliate clicks",     v: parseInt(af.affiliate_clicks).toLocaleString() },
            { l: "Affiliate conversions",v: af.affiliate_conversions },
          ].map((k) => (
            <div key={k.l} className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
              <p className="mt-2 font-display text-xl font-semibold text-navy">{k.v}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> {label}
    </span>
  );
}
