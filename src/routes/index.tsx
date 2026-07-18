import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, TrendingUp, Zap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Sign in — Income Autopilot" },
      { name: "description", content: "Sign in to your Income Autopilot dashboard." },
    ],
  }),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("hello@autopilot.io");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 600);
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Left — brand panel */}
        <aside className="relative hidden overflow-hidden bg-navy px-12 py-14 lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08] grid-lines"
            style={{ maskImage: "radial-gradient(ellipse at top left, black 30%, transparent 70%)" }}
          />
          <div className="relative flex items-center gap-3 text-primary-foreground">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
              <span className="font-mono text-sm font-semibold text-primary-foreground">IA</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-primary-foreground">Income Autopilot</span>
          </div>

          <div className="relative max-w-md text-primary-foreground">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-foreground/60">
              Dashboard · 2026
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-primary-foreground xl:text-5xl">
              Automated income,<br />measured with the care of a bank ledger.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              Track earnings across Pinterest affiliates, YouTube monetisation and your own digital products — from a
              single, quiet dashboard.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-primary-foreground/10 pt-8">
              {[
                { k: "$2,850", v: "Tracked this month" },
                { k: "3", v: "Active niches" },
                { k: "156", v: "Content pieces" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="font-display text-2xl font-semibold text-primary-foreground">{s.k}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-wider text-primary-foreground/50">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="relative font-mono text-[11px] text-primary-foreground/40">
            v1.0 · built for creators who work from a phone
          </p>
        </aside>

        {/* Right — form */}
        <section className="flex items-center justify-center px-6 py-14 sm:px-10 lg:px-16">
          <div className="w-full max-w-[420px] animate-fade-up">
            <div className="mb-10 flex items-center gap-2 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-navy">
                <span className="font-mono text-xs font-semibold text-primary-foreground">IA</span>
              </div>
              <span className="text-sm font-semibold text-navy">Income Autopilot</span>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Welcome back</p>
            <h2 className="mt-2 text-3xl font-semibold text-navy">Sign in to your dashboard</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Or{" "}
              <Link to="/" className="font-medium text-primary underline-offset-4 hover:underline">
                start a 14-day trial
              </Link>{" "}
              — no card required.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
                trailing={
                  <a href="#" className="text-xs font-medium text-primary hover:text-primary-hover">
                    Forgot?
                  </a>
                }
              />

              <label className="flex select-none items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary-soft"
                />
                Keep me signed in on this device
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-[0_1px_3px_rgba(15,23,42,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(44,90,160,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Sign in"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-border-soft pt-6 text-[11px] text-muted-foreground">
              {[
                { icon: TrendingUp, label: "Real-time revenue" },
                { icon: Zap, label: "3-niche workflows" },
                { icon: ShieldCheck, label: "Bank-grade security" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-start gap-2">
                  <f.icon className="h-4 w-4 text-primary" strokeWidth={2} />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  trailing,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[13px] font-medium text-navy">{label}</label>
        {trailing}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="h-11 w-full rounded-md border border-border bg-cream-soft px-3.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary-soft"
      />
    </div>
  );
}
