import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Fingerprint, Lock, Radar, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { JobCard, type JobRow } from "@/components/site/JobCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Secure Tech Consultancy (Pvt) Ltd — IT Security & Biometrics, Islamabad" },
      {
        name: "description",
        content:
          "Secure Tech Consultancy delivers IT security, biometrics and identity management solutions to enterprise and public-sector clients from Islamabad.",
      },
      { property: "og:title", content: "Secure Tech Consultancy (Pvt) Ltd" },
      {
        property: "og:description",
        content: "IT security, biometrics and identity management solutions from Islamabad.",
      },
    ],
  }),
  component: Home,
});

const SERVICES = [
  { icon: ShieldCheck, title: "Enterprise Security", text: "Perimeter, endpoint and application security engineered for critical infrastructure." },
  { icon: Fingerprint, title: "Biometrics", text: "Fingerprint, facial and iris identification platforms for national-scale identity programmes." },
  { icon: Radar, title: "Security Operations", text: "24/7 monitoring, threat hunting and incident response from our Islamabad SOC." },
  { icon: Lock, title: "Compliance & Audit", text: "ISO 27001, PCI-DSS and regulatory readiness assessments." },
];

function Home() {
  const { data: jobs } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("published", true)
        .eq("status", "Open")
        .order("posting_date", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as JobRow[];
    },
  });

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-navy">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-24 lg:grid-cols-2 lg:px-6">
          <div>
            <span className="inline-block rounded-full bg-brand/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand">
              Islamabad, Pakistan
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Securing identities, networks and critical national infrastructure
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Secure Tech Consultancy (Pvt) Ltd builds IT security and biometric identification
              systems trusted by enterprise and public-sector organisations across Pakistan.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/careers"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 font-bold text-white transition-opacity hover:opacity-90"
              >
                Explore Careers <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="rounded-full border-2 border-white/40 px-7 py-3 font-bold text-white transition-colors hover:border-brand hover:text-brand"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <s.icon className="h-7 w-7 text-brand" />
                <h2 className="mt-4 font-bold text-white">{s.title}</h2>
                <p className="mt-2 text-sm text-white/70">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-navy">Current Openings</h2>
            <p className="mt-2 text-slate-600">
              Join us to make a difference through your experience.
            </p>
          </div>
          <Link to="/careers" className="font-bold text-brand hover:text-brand-dark">
            View all positions →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(jobs ?? []).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
