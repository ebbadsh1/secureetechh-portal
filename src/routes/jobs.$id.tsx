import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CalendarDays, MapPin, Users } from "lucide-react";
import { PageBanner, SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import type { JobRow } from "@/components/site/JobCard";
import { formatDate } from "@/lib/portal";
import { useAuth } from "@/lib/auth";

type JobDetail = JobRow & { responsibilities: string; requirements: string; openings: number };

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({
    meta: [
      { title: "Job Opening — Secure Tech Consultancy Careers" },
      {
        name: "description",
        content:
          "Full job description, responsibilities and requirements for this opening at Secure Tech Consultancy, Islamabad.",
      },
      { property: "og:title", content: "Job Opening — Secure Tech Consultancy" },
      {
        property: "og:description",
        content: "Apply online for this position at Secure Tech Consultancy, Islamabad.",
      },
    ],
  }),
  component: JobDetailPage,
});

function Bullets({ text }: { text: string }) {
  const items = text.split("\n").filter((l) => l.trim());
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2">
      {items.map((line, i) => (
        <li key={i} className="flex gap-3 text-slate-700">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function JobDetailPage() {
  const { id } = useParams({ from: "/jobs/$id" });
  const { user, isHR } = useAuth();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as JobDetail | null;
    },
  });

  return (
    <SiteLayout>
      <PageBanner
        title="Explore Amazing Career Possibilities With Secure Tech Consultancy"
        subtitle="Join Us To Make A Difference Through Your Experience"
        crumb="Careers"
      />
      <section className="mx-auto max-w-4xl px-4 pb-20 lg:px-6">
        {isLoading ? (
          <p className="py-16 text-center text-muted-foreground">Loading…</p>
        ) : !job ? (
          <p className="py-16 text-center text-muted-foreground">This position is no longer available.</p>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-navy md:text-4xl">JOB: {job.title}</h1>
            <p className="mt-4 text-lg text-slate-700">Location: {job.location}</p>
            <p className="mt-2 text-lg text-slate-700">Position(s): {job.openings}</p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 font-semibold text-brand-dark">
                <Briefcase className="h-4 w-4" /> {job.employment_type}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700">
                <Users className="h-4 w-4" /> {job.department}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700">
                <CalendarDays className="h-4 w-4" /> Apply before {formatDate(job.closing_date)}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700">
                <MapPin className="h-4 w-4 text-accent-red" /> Islamabad
              </span>
            </div>

            <div className="mt-10 space-y-8">
              <div>
                <h2 className="text-xl font-extrabold text-navy">Job Description</h2>
                <p className="mt-3 leading-relaxed text-slate-700">{job.description}</p>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-navy">Responsibilities</h2>
                <Bullets text={job.responsibilities} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-navy">Requirements</h2>
                <Bullets text={job.requirements} />
              </div>
            </div>

            {!isHR && (
              <div className="mt-12 rounded-xl border border-brand/30 bg-brand-soft p-6">
                <h2 className="text-lg font-extrabold text-navy">Ready to apply?</h2>
                <p className="mt-1 text-sm text-slate-700">
                  {user
                    ? "Your saved profile will be attached to this application."
                    : "Create a candidate account once, then apply to any position without re-entering your details."}
                </p>
                <Link
                  to={user ? "/apply/$jobId" : "/auth"}
                  params={{ jobId: job.id }}
                  search={user ? {} : { redirect: `/apply/${job.id}` }}
                  className="mt-5 inline-block rounded-full bg-brand px-8 py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  Apply Now
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}
