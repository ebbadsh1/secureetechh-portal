import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageBanner({
  title,
  subtitle,
  crumb,
}: {
  title: string;
  subtitle?: string;
  crumb: string;
}) {
  return (
    <>
      <section className="w-full bg-brand py-14">
        <div className="mx-auto max-w-7xl px-4 text-right lg:px-6">
          <h1 className="ml-auto max-w-4xl text-3xl font-extrabold leading-tight text-white md:text-[42px]">
            {title}
          </h1>
          {subtitle && (
            <p className="ml-auto mt-6 max-w-3xl text-lg font-medium text-white/95 md:text-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </section>
      <nav className="mx-auto max-w-7xl px-4 py-8 text-sm lg:px-6" aria-label="Breadcrumb">
        <Link to="/" className="text-muted-foreground hover:text-brand">
          Home
        </Link>
        <span className="px-2 text-muted-foreground">/</span>
        <span className="font-medium text-accent-red">{crumb}</span>
      </nav>
    </>
  );
}
