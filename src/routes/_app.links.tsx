import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Copy, Check, ExternalLink, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { affiliateLinks } from "@/lib/dashboard-data";

export const Route = createFileRoute("/_app/links")({
  component: LinksPage,
  head: () => ({ meta: [{ title: "Affiliate links — Income Autopilot" }] }),
});

function LinksPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string, slug: string) => {
    navigator.clipboard?.writeText(`https://ia.link/${slug}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  const total = affiliateLinks.reduce((s, l) => s + l.revenue, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={`${affiliateLinks.length} tracked links`}
        title="Affiliate links"
        description="Short, trackable links across your networks. Every click routed and attributed."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> New link
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Active", v: affiliateLinks.filter((l) => l.active).length },
          { l: "Clicks", v: affiliateLinks.reduce((s, l) => s + l.clicks, 0).toLocaleString() },
          { l: "Conversions", v: affiliateLinks.reduce((s, l) => s + l.conversions, 0) },
          { l: "Revenue", v: `$${total.toFixed(2)}` },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
            <p className="mt-2 font-display text-xl font-semibold text-navy">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {affiliateLinks.map((link, i) => (
          <article
            key={link.id}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fade-up hover-lift group rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                      (link.active ? "bg-success/15 text-success" : "bg-cream-warm text-muted-foreground")
                    }
                  >
                    <span className={"h-1.5 w-1.5 rounded-full " + (link.active ? "bg-success" : "bg-muted-foreground")} />
                    {link.active ? "Active" : "Paused"}
                  </span>
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                    {link.niche}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-[15px] font-semibold text-navy">{link.product}</h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {link.network} · {link.commission} commission
                </p>
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-cream-soft hover:text-navy">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-md border border-border-soft bg-cream-soft px-3 py-2">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-primary">
                ia.link/{link.slug}
              </code>
              <button
                onClick={() => copy(link.id, link.slug)}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-card px-2 text-[11px] font-medium text-navy shadow-subtle transition hover:bg-primary-soft"
              >
                {copied === link.id ? (
                  <>
                    <Check className="h-3 w-3 text-success" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-soft pt-3 text-center">
              <Stat label="Clicks" value={link.clicks.toLocaleString()} />
              <Stat label="Conversions" value={String(link.conversions)} />
              <Stat label="Revenue" value={`$${link.revenue.toFixed(2)}`} accent />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className={"font-display text-sm font-semibold " + (accent ? "text-primary" : "text-navy")}>{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
