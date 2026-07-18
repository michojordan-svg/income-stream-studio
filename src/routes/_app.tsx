import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Link2,
  Package,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/content", label: "Content", icon: FolderKanban },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/links", label: "Affiliate links", icon: Link2 },
  { to: "/products", label: "Products", icon: Package },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-navy px-4 py-6 lg:flex">
        <SidebarInner pathname={pathname} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm animate-fade-up" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-navy px-4 py-6 shadow-strong animate-fade-up">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md text-primary-foreground/70 hover:bg-primary-foreground/10"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarInner pathname={pathname} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <button
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-navy transition hover:bg-cream-soft lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search content, links, products…"
              className="h-10 w-full rounded-md border border-border bg-cream-soft pl-9 pr-16 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary-soft"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="relative grid h-10 w-10 place-items-center rounded-md border border-border bg-card text-navy transition hover:bg-cream-soft"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-success" />
            </button>
            <button className="flex h-10 items-center gap-2 rounded-md border border-border bg-card pl-1 pr-3 transition hover:bg-cream-soft">
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-md bg-navy font-mono text-xs font-semibold text-primary-foreground"
              >
                AK
              </span>
              <span className="hidden text-sm font-medium text-navy sm:inline">Alex</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarInner({ pathname }: { pathname: string }) {
  return (
    <>
      <Link to="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary-foreground/10 ring-1 ring-primary-foreground/15">
          <span className="font-mono text-[13px] font-semibold text-primary-foreground">IA</span>
        </span>
        <span className="text-sm font-semibold tracking-tight text-primary-foreground">Income Autopilot</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/40">
          Workspace
        </p>
        {nav.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 " +
                (active
                  ? "bg-primary-foreground/10 text-primary-foreground shadow-[inset_2px_0_0_theme(colors.success)]"
                  : "text-primary-foreground/65 hover:bg-primary-foreground/5 hover:text-primary-foreground hover:translate-x-0.5")
              }
            >
              <item.icon className="h-4 w-4" strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-lg border border-primary-foreground/10 bg-primary-foreground/[0.04] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/50">This month</p>
        <p className="mt-2 font-display text-2xl font-semibold text-primary-foreground">$2,850.75</p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-success">
          <span className="inline-block h-1 w-1 rounded-full bg-success" />
          <span className="font-medium">+14.2% vs last month</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-primary-foreground/10">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-primary to-primary-hover" />
        </div>
        <p className="mt-2 font-mono text-[10px] text-primary-foreground/40">Goal $4,000 · 72%</p>
      </div>
    </>
  );
}
