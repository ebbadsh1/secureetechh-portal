import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageBanner, SiteLayout } from "@/components/site/SiteLayout";
import { JobCard, type JobRow } from "@/components/site/JobCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYMENT_TYPES } from "@/lib/portal";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers at Secure Tech Consultancy — Jobs in Islamabad" },
      {
        name: "description",
        content:
          "Explore amazing career possibilities with Secure Tech Consultancy. Browse open IT security, biometrics and engineering roles in Islamabad and apply online.",
      },
      { property: "og:title", content: "Careers at Secure Tech Consultancy" },
      {
        property: "og:description",
        content: "Join us to make a difference through your experience. Apply online today.",
      },
    ],
  }),
  component: Careers,
});

function Careers() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [type, setType] = useState("all");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["open-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("published", true)
        .eq("status", "Open")
        .order("posting_date", { ascending: false });
      if (error) throw error;
      return data as JobRow[];
    },
  });

  const departments = useMemo(
    () => Array.from(new Set((jobs ?? []).map((j) => j.department))).sort(),
    [jobs],
  );

  const filtered = (jobs ?? []).filter(
    (j) =>
      (dept === "all" || j.department === dept) &&
      (type === "all" || j.employment_type === type) &&
      (q.trim() === "" ||
        `${j.title} ${j.department} ${j.employment_type}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <SiteLayout>
      <PageBanner
        title="Explore Amazing Career Possibilities With Secure Tech Consultancy"
        subtitle="Join Us To Make A Difference Through Your Experience"
        crumb="Careers"
      />

      <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-6">
        <div className="grid gap-3 rounded-xl border border-border bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by job title, department or type…"
              className="bg-white pl-9"
              aria-label="Search jobs"
            />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-full bg-white md:w-52" aria-label="Filter by department">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full bg-white md:w-48" aria-label="Filter by employment type">
              <SelectValue placeholder="Employment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {EMPLOYMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        {isLoading ? (
          <p className="py-16 text-center text-muted-foreground">Loading open positions…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No positions match your filters right now.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing {filtered.length} open position{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
