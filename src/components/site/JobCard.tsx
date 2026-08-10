import { Link } from "@tanstack/react-router";
import { Briefcase, Building2, CalendarDays, MapPin } from "lucide-react";
import { formatDate } from "@/lib/portal";

export type JobRow = {
  id: string;
  title: string;
  department: string;
  employment_type: string;
  location: string;
  posting_date: string;
  closing_date: string | null;
  status: string;
  published: boolean;
  description: string;
};

export function JobCard({ job }: { job: JobRow }) {
  return (
    <article className="group flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-extrabold text-navy group-hover:text-brand">
          JOB: {job.title}
        </h3>
        <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">
          {job.employment_type}
        </span>
      </div>

      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent-red" />
          <span>Location: {job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand" />
          <span>{job.department}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-brand" />
          <span>Posted {formatDate(job.posting_date)}</span>
        </div>
      </dl>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{job.description}</p>

      <Link
        to="/jobs/$id"
        params={{ id: job.id }}
        className="mt-6 inline-flex items-center gap-2 self-start rounded-full border-2 border-brand px-5 py-2 text-sm font-bold text-navy transition-colors hover:bg-brand hover:text-white"
      >
        <Briefcase className="h-4 w-4" /> View Details
      </Link>
    </article>
  );
}
