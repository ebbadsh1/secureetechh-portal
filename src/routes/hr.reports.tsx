import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APPLICATION_STATUSES } from "@/lib/portal";

export const Route = createFileRoute("/hr/reports")({
  head: () => ({
    meta: [
      { title: "Recruitment Reports — Secure Tech HR Portal" },
      {
        name: "description",
        content:
          "Generate hiring funnel and application reports by date range and export them to Excel.",
      },
      { property: "og:title", content: "Recruitment Reports — Secure Tech HR" },
      { property: "og:description", content: "Hiring funnel and application reporting." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HRReports,
});

function HRReports() {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfYear = `${new Date().getFullYear()}-01-01`;
  const [from, setFrom] = useState(firstOfYear);
  const [to, setTo] = useState(today);

  const { data, isLoading } = useQuery({
    queryKey: ["hr", "reports"],
    queryFn: async () => {
      const [apps, jobs] = await Promise.all([
        supabase.from("applications").select("id,status,created_at,job_id"),
        supabase.from("jobs").select("id,title,department"),
      ]);
      return { apps: apps.data ?? [], jobs: jobs.data ?? [] };
    },
  });

  const filtered = useMemo(
    () =>
      (data?.apps ?? []).filter((a) => {
        const d = a.created_at.slice(0, 10);
        return d >= from && d <= to;
      }),
    [data, from, to],
  );

  const perJob = (data?.jobs ?? []).map((j) => {
    const list = filtered.filter((a) => a.job_id === j.id);
    const counts: Record<string, number> = {};
    for (const s of APPLICATION_STATUSES) counts[s] = list.filter((a) => a.status === s).length;
    return { job: j.title, department: j.department, total: list.length, counts };
  });

  const funnel = [
    { stage: "New", count: filtered.length },
    {
      stage: "Shortlisted",
      count: filtered.filter((a) => ["Shortlisted", "Interviewed", "Hired"].includes(a.status)).length,
    },
    {
      stage: "Interviewed",
      count: filtered.filter((a) => ["Interviewed", "Hired"].includes(a.status)).length,
    },
    { stage: "Hired", count: filtered.filter((a) => a.status === "Hired").length },
  ];

  const exportReport = () => {
    if (filtered.length === 0) {
      toast.error("No applications in this date range");
      return;
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perJob.map((r) => ({ Job: r.job, Department: r.department, Total: r.total, ...r.counts }))), "Applications per job");
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        funnel.map((f) => ({
          Stage: f.stage,
          Count: f.count,
          "Conversion %": filtered.length
            ? `${Math.round((f.count / filtered.length) * 100)}%`
            : "0%",
        })),
      ),
      "Hiring funnel",
    );
    XLSX.writeFile(wb, `securetech-report-${from}_to_${to}.xlsx`);
    toast.success("Report exported");
  };

  return (
    <HRLayout
      title="Reports"
      description="Hiring performance for the selected period"
      actions={
        <Button className="bg-brand hover:bg-brand-dark" onClick={exportReport}>
          <FileSpreadsheet className="mr-1 h-4 w-4" /> Export Excel
        </Button>
      }
    >
      <div className="flex flex-wrap gap-4 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <Label htmlFor="rf">From</Label>
          <Input id="rf" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rt">To</Label>
          <Input id="rt" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="ml-auto self-end text-sm text-muted-foreground">
          {filtered.length} application{filtered.length === 1 ? "" : "s"} in range
        </div>
      </div>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {funnel.map((f) => (
              <div key={f.stage} className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">{f.stage}</p>
                <p className="mt-2 text-3xl font-extrabold text-navy">{f.count}</p>
                <p className="text-xs text-brand-dark">
                  {filtered.length ? Math.round((f.count / filtered.length) * 100) : 0}% of applicants
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Total</th>
                  {APPLICATION_STATUSES.map((s) => (
                    <th key={s} className="px-4 py-3">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {perJob.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-navy">{r.job}</td>
                    <td className="px-4 py-3">{r.department}</td>
                    <td className="px-4 py-3">{r.total}</td>
                    {APPLICATION_STATUSES.map((s) => (
                      <td key={s} className="px-4 py-3">
                        {r.counts[s]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </HRLayout>
  );
}
