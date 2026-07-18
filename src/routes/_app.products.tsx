import { createFileRoute } from "@tanstack/react-router";
import { Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { useProducts } from "@/hooks/useApi";
import { products as staticProducts } from "@/lib/dashboard-data";
import type { Product } from "@/lib/api";

export const Route = createFileRoute("/_app/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Digital products — Income Autopilot" }] }),
});

const ACCENTS = [
  { accent: "#2c5aa0", soft: "#e8f0f9" },
  { accent: "#f59e0b", soft: "#fef7e6" },
  { accent: "#10b981", soft: "#ecfdf5" },
  { accent: "#2c5aa0", soft: "#e8f0f9" },
];

function toDisplay(p: Product, i: number) {
  const { accent, soft } = ACCENTS[i % ACCENTS.length];
  return {
    id:          p.id,
    name:        p.name,
    type:        p.product_type ?? "Product",
    description: p.description ?? "",
    price:       typeof p.price === "string" ? parseFloat(p.price) : p.price,
    sales:       p.sales_count,
    revenue:     typeof p.revenue === "string" ? parseFloat(p.revenue) : p.revenue,
    margin:      95, // not in DB yet — sensible placeholder
    accent,
    soft,
  };
}

function ProductsPage() {
  const { data, isLoading } = useProducts({ limit: 50 });

  const raw = data?.data ?? [];
  const products = raw.length ? raw.map(toDisplay) : staticProducts;

  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const totalSales   = products.reduce((s, p) => s + p.sales, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Create once · sell infinitely"
        title="Digital products"
        description="Every template, guide and course you've shipped — and how each one is earning."
        actions={
          <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> New product
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Products",    v: products.length },
          { l: "Total sales", v: totalSales },
          { l: "Revenue",     v: `$${totalRevenue.toLocaleString()}` },
          { l: "Avg. price",  v: totalSales ? `$${(totalRevenue / totalSales).toFixed(2)}` : "—" },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
            <p className="mt-2 font-display text-xl font-semibold text-navy">{k.v}</p>
          </div>
        ))}
      </div>

      {isLoading && !raw.length && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p, i) => (
          <article
            key={p.id}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fade-up hover-lift group flex flex-col overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: p.soft }}>
              <div className="absolute inset-0 grid-lines opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-lg px-4 py-2 font-display text-2xl font-semibold" style={{ color: p.accent, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)" }}>
                  {p.name.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
              <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur" style={{ color: p.accent }}>
                {p.type}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-navy/90 px-2.5 py-1 font-display text-[13px] font-semibold text-primary-foreground">
                ${p.price.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-[15px] font-semibold text-navy">{p.name}</h3>
              <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">{p.description}</p>

              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3 border-t border-border-soft pt-4">
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="Sales"   value={String(p.sales)} />
                  <Stat label="Revenue" value={`${p.revenue.toFixed(2)}`} />
                  <Stat label="Margin"  value={`${p.margin}%`} />
                </div>
                <div className="w-16">
                  <Sparkline data={[4, 6, 8, 7, 10, 12, 14, 18, 22, 24, 28, 32]} color={p.accent} />
                </div>
              </div>

              <button className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-cream-soft text-[13px] font-medium text-navy transition hover:bg-primary-soft hover:text-primary">
                View details <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
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
