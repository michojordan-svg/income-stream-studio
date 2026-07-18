import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Sliders, Key, Plug, CreditCard, LifeBuoy, Check } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useSettings, usePlatformConnections } from "@/hooks/useApi";
import { authApi } from "@/lib/api";
import { auth } from "@/lib/auth";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Income Autopilot" }] }),
});

const tabs = [
  { id: "account",     label: "Account",     icon: User },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "keys",        label: "API keys",    icon: Key },
  { id: "platforms",   label: "Platforms",   icon: Plug },
  { id: "billing",     label: "Billing",     icon: CreditCard },
  { id: "support",     label: "Support",     icon: LifeBuoy },
] as const;

function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("account");

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="Configuration" title="Settings" description="Fine-tune how Income Autopilot works for you." />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={"flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 " + (active ? "bg-primary-soft text-primary shadow-[inset_2px_0_0_theme(colors.primary)]" : "text-muted-foreground hover:bg-cream-soft hover:text-navy")}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {tab === "account"     && <AccountTab />}
          {tab === "preferences" && <PreferencesTab />}
          {tab === "keys"        && <KeysTab />}
          {tab === "platforms"   && <PlatformsTab />}
          {tab === "billing"     && <BillingTab />}
          {tab === "support"     && <SupportTab />}
        </div>
      </div>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-4 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-[15px] font-semibold text-navy">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-[13px] font-medium text-navy">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={"h-11 w-full rounded-md border border-border bg-cream-soft px-3.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary-soft " + (props.className || "")}
    />
  );
}

function AccountTab() {
  const user = auth.getUser();
  const [username, setUsername] = useState(user?.username ?? "");
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [saving, setSaving]          = useState(false);
  const [pwSaving, setPwSaving]      = useState(false);
  const [msg, setMsg]               = useState<string | null>(null);
  const [pwMsg, setPwMsg]           = useState<string | null>(null);

  const saveProfile = async () => {
    setSaving(true); setMsg(null);
    try {
      const { user: u } = await authApi.updateMe({ username });
      auth.setUser(u);
      setMsg("Profile saved.");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Save failed.");
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    setPwSaving(true); setPwMsg(null);
    try {
      await authApi.changePassword(currentPw, newPw);
      setPwMsg("Password updated.");
      setCurrentPw(""); setNewPw("");
    } catch (e: unknown) {
      setPwMsg(e instanceof Error ? e.message : "Failed.");
    } finally { setPwSaving(false); }
  };

  return (
    <>
      <Card title="Profile" description="Update how you appear across the dashboard.">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-navy font-display text-lg font-semibold text-primary-foreground">
            {(username || user?.email || "IA").slice(0, 2).toUpperCase()}
          </span>
          <button className="h-9 rounded-md border border-border bg-cream-soft px-3.5 text-[13px] font-medium text-navy hover:bg-primary-soft">
            Change avatar
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Display name</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user?.email ?? ""} disabled />
          </div>
        </div>
        {msg && <p className="mt-3 text-[13px] text-success">{msg}</p>}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </Card>

      <Card title="Password & security" description="Change your password below.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Current password</Label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div>
            <Label>New password</Label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" />
          </div>
        </div>
        {pwMsg && <p className="mt-3 text-[13px] text-success">{pwMsg}</p>}
        <div className="mt-5 flex justify-end">
          <button
            onClick={changePassword}
            disabled={pwSaving || !currentPw || newPw.length < 8}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
          >
            {pwSaving ? "Updating…" : "Update password"}
          </button>
        </div>
      </Card>

      <Card title="Danger zone" description="Permanent actions. Please review carefully.">
        <button className="inline-flex h-10 items-center rounded-md border border-error/40 bg-error/5 px-4 text-sm font-semibold text-error transition hover:bg-error/10">
          Delete account
        </button>
      </Card>
    </>
  );
}

function PreferencesTab() {
  const { data } = useSettings();
  const prefs = data?.preferences ?? {};

  return (
    <Card title="Automation preferences" description="How Income Autopilot behaves when you're not watching.">
      <ul className="space-y-3">
        {[
          { key: "auto_schedule",  l: "Auto-schedule Pinterest pins",  d: "Fill quiet slots between manual posts." },
          { key: "weekly_digest",  l: "Weekly performance digest",     d: "Emailed every Monday at 8 am." },
          { key: "revenue_alert",  l: "Alert on revenue drop",         d: "Notify if daily revenue drops 20% below trend." },
          { key: "auto_pause",     l: "Auto-pause underperformers",    d: "Pause pins earning less than $0.01/click after 500 clicks." },
        ].map((p, i) => (
          <li key={p.key} className="flex items-center justify-between gap-4 rounded-md border border-border-soft bg-cream-soft px-4 py-3">
            <div>
              <p className="text-[13.5px] font-medium text-navy">{p.l}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{p.d}</p>
            </div>
            <Toggle defaultOn={prefs[p.key] !== false && i < 3} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function KeysTab() {
  const { data } = useSettings();
  const connected = data?.connected_services ?? [];

  const known = [
    { name: "OpenAI",    key: "OPENAI_API_KEY" },
    { name: "Pinterest", key: "PINTEREST_ACCESS_TOKEN" },
    { name: "YouTube",   key: "YOUTUBE_API_KEY" },
    { name: "Buffer",    key: "BUFFER_ACCESS_TOKEN" },
    { name: "Gumroad",   key: "GUMROAD_ACCESS_TOKEN" },
    { name: "Bitly",     key: "BITLY_ACCESS_TOKEN" },
  ];

  return (
    <Card title="API keys" description="Add keys via Replit Secrets to enable each integration.">
      <ul className="space-y-3">
        {known.map((k) => {
          const ok = connected.includes(k.key);
          return (
            <li key={k.name} className="rounded-md border border-border-soft bg-cream-soft p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[13.5px] font-medium text-navy">{k.name}</span>
                  <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " + (ok ? "bg-success/15 text-success" : "bg-cream-warm text-muted-foreground")}>
                    {ok ? "Connected" : "Not set"}
                  </span>
                </div>
                <code className="font-mono text-[11px] text-muted-foreground">{k.key}</code>
              </div>
              {!ok && (
                <p className="mt-2 text-[12px] text-muted-foreground">
                  Add <code className="font-mono">{k.key}</code> in Replit Secrets (padlock icon) to enable this integration.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function PlatformsTab() {
  const { data } = usePlatformConnections();
  const connections = data?.connections ?? [];

  const known = ["Pinterest", "YouTube", "Gumroad", "Buffer"];
  const connected = new Set(connections.map((c) => c.platform_name));

  return (
    <Card title="Connected platforms" description="Where your content and revenue lives.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {known.map((name) => {
          const conn = connections.find((c) => c.platform_name === name);
          const ok   = connected.has(name);
          return (
            <div
              key={name}
              className={"flex items-center justify-between rounded-md border p-4 " + (ok ? "border-success/25 bg-success/5" : "border-border bg-cream-soft")}
            >
              <div>
                <p className="text-[13.5px] font-semibold text-navy">{name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {conn ? conn.account_name ?? "Connected" : "Not connected"}
                </p>
              </div>
              {ok ? (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-success/20 text-success">
                  <Check className="h-4 w-4" />
                </span>
              ) : (
                <button className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary-hover">
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function BillingTab() {
  return (
    <Card title="Billing" description="You're on the Pro plan — $19 / month.">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-border-soft bg-cream-soft p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-14 place-items-center rounded-md bg-navy font-mono text-[11px] font-semibold text-primary-foreground">VISA</div>
          <div>
            <p className="text-[13.5px] font-medium text-navy">Visa ending in 4242</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Next charge Aug 12, 2026</p>
          </div>
        </div>
        <button className="h-9 rounded-md border border-border bg-card px-3.5 text-[13px] font-medium text-navy hover:bg-primary-soft">
          Update card
        </button>
      </div>
    </Card>
  );
}

function SupportTab() {
  return (
    <Card title="Support" description="We answer in under 12 hours, most days.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a href="#" className="rounded-md border border-border-soft bg-cream-soft p-4 hover:bg-primary-soft">
          <p className="text-[13.5px] font-semibold text-navy">Documentation</p>
          <p className="mt-1 text-[12px] text-muted-foreground">Guides, video tutorials, API docs.</p>
        </a>
        <a href="mailto:hello@autopilot.io" className="rounded-md border border-border-soft bg-cream-soft p-4 hover:bg-primary-soft">
          <p className="text-[13.5px] font-semibold text-navy">Email us</p>
          <p className="mt-1 text-[12px] text-muted-foreground">hello@autopilot.io</p>
        </a>
      </div>
    </Card>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={"relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 " + (on ? "bg-primary" : "bg-muted")}
      aria-pressed={on}
    >
      <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-subtle transition-transform duration-200 " + (on ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}
