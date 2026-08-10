import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Products", to: "/products" },
  { label: "Our Customers", to: "/customers" },
  { label: "Publications", to: "/publications" },
  { label: "Careers", to: "/careers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isHR, signOut } = useAuth();

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 lg:px-6">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 xl:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`relative py-6 text-[15px] font-bold transition-colors ${
                isActive(l.to)
                  ? "text-brand after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-brand"
                  : "text-slate-700 hover:text-brand"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <Link
            to="/contact"
            className="rounded-full border-2 border-brand px-5 py-2 text-sm font-bold text-navy transition-colors hover:bg-brand hover:text-white"
          >
            Contact Us
          </Link>
          {isHR ? (
            <Link
              to="/hr"
              className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              HR Portal
            </Link>
          ) : (
            <Link
              to="/hr-login"
              className="flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <ShieldCheck className="h-4 w-4" /> HR Login
            </Link>
          )}
          {user ? (
            <>
              {!isHR && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 text-sm font-bold text-slate-700 hover:text-brand"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth" className="px-2 text-sm font-bold text-slate-700 hover:text-brand">
              Sign in
            </Link>
          )}
        </div>

        <button
          className="xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-4 py-3 xl:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2 text-sm font-bold ${
                  isActive(l.to) ? "bg-brand-soft text-brand-dark" : "text-slate-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-bold text-slate-700"
            >
              Contact Us
            </Link>
            <Link
              to={isHR ? "/hr" : "/hr-login"}
              onClick={() => setOpen(false)}
              className="rounded-md bg-navy px-2 py-2 text-center text-sm font-bold text-white"
            >
              {isHR ? "HR Portal" : "HR Login"}
            </Link>
            {user ? (
              <>
                {!isHR && (
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-sm font-bold text-slate-700"
                  >
                    My Dashboard
                  </Link>
                )}
                <button
                  onClick={() => void signOut()}
                  className="rounded-md px-2 py-2 text-left text-sm font-bold text-slate-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-bold text-slate-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
