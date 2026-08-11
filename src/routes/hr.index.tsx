import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Users, FileText, CheckCircle2 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { HRLayout, StatCard } from "@/components/hr/HRLayout";
import { APPLICATION_STATUSES, STATUS_STYLES, formatDate } from "@/lib/portal";

export const Route = createFileRoute("/hr/")({
  head: () => ({
    meta: [
      { title: "HR Dashboard — Secure Tech Careers Portal" },
      {
        name: "description",
        content:
          "Recruitment analytics for Secure Tech Consultancy: open jobs, candidates, applications and hiring pipeline.",
      },
      { property: "og:title", content: "HR Dashboard — Secure Tech Careers" },
      { property: "og:description", content: "Recruitment analytics and hiring pipeline." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HRDashboard,
});

const COLORS = ["#94a3b8", "#f59e0b", "#3b82f6", "#6FA84B", "#ef4444"];

function HRDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["hr", "dashboard"],
    queryFn: async () => {
      const [jobs, candidates, apps] = await Promise.all([
        supabase.from("jobs").select("id,title,department,status,published"),
        supabase.from("candidates").select("user_id"),
        supabase.from("applications").select("id,status,created_at,job_id"),
      ]);
      return {
        jobs: jobs.data ?? [],
        candidates: candidates.data ?? [],
        apps: apps.data ?? [],
      };
    },
  });

  const jobs = data?.jobs ?? [];
  const apps = data?.apps ?? [];
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const byStatus = APPLICATION_STATUSES.map((s) => ({
    name: s,
    value: apps.filter((a) => a.status === s).length,
  }));

  const deptMap = new Map<string, number>();
  for (const a of apps) {
    const job = jobs.find((j) => j.id === a.job_id);
    const dept = job?.department ?? "Other";
    deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
  }
  const byDept = [...deptMap.entries()].map(([name, value]) => ({ name, value }));

  const recent = [...apps]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6)
    .map((a) => ({ ...a, job: jobs.find((j) => j.id === a.job_id) }));

  return (
    <HRLayout title="Recruitment Dashboard" description="Live overview of hiring activity">
      {isLoading ? (
        <p className="text-muted-foreground">Loading dashboard…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Open jobs"
              value={jobs.filter((j) => j.status === "Open" && j.published).length}
              icon={Briefcase}
            />
            <StatCard label="Candidates" value={data?.candidates.length ?? 0} icon={Users} />
            <StatCard
              label="Applications this month"
              value={apps.filter((a) => new Date(a.created_at) >= monthStart).length}
              icon={FileText}
            />
            <StatCard
              label="Hired"
              value={apps.filter((a) => a.status === "Hired").length}
              icon={CheckCircle2}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="font-bold text-navy">Applications by status</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                      {byStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2">
                {byStatus.map((s) => (
                  <span
                    key={s.name}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[s.name]}`}
                  >
                    {s.name}: {s.value}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="font-bold text-navy">Applications by department</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDept}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6FA84B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-navy">Recent applications</h2>
              <Link to="/hr/applications" className="text-sm font-semibold text-brand-dark hover:underline">
                View all →
              </Link>
            </div>
            <ul className="mt-4 divide-y">
              {recent.length === 0 ? (
                <li className="py-4 text-sm text-muted-foreground">No applications yet.</li>
              ) : (
                recent.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{a.job?.title ?? "Job"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </HRLayout>
  );
}
