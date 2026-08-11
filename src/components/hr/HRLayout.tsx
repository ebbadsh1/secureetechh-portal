import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/portal/RequireAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/hr", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hr/jobs", label: "Job Postings", icon: Briefcase },
  { to: "/hr/candidates", label: "Candidates", icon: Users },
  { to: "/hr/applications", label: "Applications", icon: FileText },
  { to: "/hr/reports", label: "Reports", icon: BarChart3 },
] as const;

export function HRLayout({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact: item.to === "/hr" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          activeProps={{ className: "bg-brand text-white hover:bg-brand" }}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <RequireAuth hrOnly>
      <div className="flex min-h-screen bg-slate-50">
        <aside className="hidden w-64 shrink-0 flex-col bg-navy p-5 lg:flex">
          <Link to="/" className="text-lg font-extrabold text-white">
            Secure<span className="text-brand">Tech</span>
            <span className="block text-[11px] font-medium text-white/50">HR Administration</span>
          </Link>
          <div className="mt-8 flex-1">{nav}</div>
          <div className="border-t border-white/10 pt-4">
            <p className="truncate text-xs text-white/50">{user?.email}</p>
            <button
              onClick={async () => {
                await signOut();
                void navigate({ to: "/hr-login" });
              }}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b bg-white px-4 py-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-extrabold text-navy">{title}</h1>
              {description ? (
                <p className="truncate text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions}
          </header>
          <div className={cn("bg-navy px-4 py-3 lg:hidden", open ? "block" : "hidden")}>{nav}</div>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="rounded-lg bg-brand-soft p-2 text-brand-dark">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );
}
