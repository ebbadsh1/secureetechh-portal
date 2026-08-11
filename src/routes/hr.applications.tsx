import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  APPLICATION_STATUSES,
  STATUS_STYLES,
  formatDate,
  type ApplicationStatus,
} from "@/lib/portal";

export const Route = createFileRoute("/hr/applications")({
  head: () => ({
    meta: [
      { title: "Applications — Secure Tech HR Portal" },
      {
        name: "description",
        content:
          "Review applications, update candidate status and record interview notes for Secure Tech Consultancy.",
      },
      { property: "og:title", content: "Applications — Secure Tech HR" },
      { property: "og:description", content: "Application status and interview notes management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HRApplications,
});

function HRApplications() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [remarkFor, setRemarkFor] = useState<string | null>(null);
  const [remarkBody, setRemarkBody] = useState("");
  const [remarkType, setRemarkType] = useState("HR Remark");

  const { data, isLoading } = useQuery({
    queryKey: ["hr", "applications"],
    queryFn: async () => {
      const [apps, jobs, cands, remarks] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("jobs").select("id,title,department"),
        supabase.from("candidates").select("user_id,full_name,email,contact_number"),
        supabase.from("hr_remarks").select("*").order("created_at", { ascending: false }),
      ]);
      return {
        apps: apps.data ?? [],
        jobs: jobs.data ?? [],
        cands: cands.data ?? [],
        remarks: remarks.data ?? [],
      };
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
      await supabase
        .from("application_status_history")
        .insert({ application_id: id, status, changed_by: user?.id ?? null });
    },
    onSuccess: () => {
      toast.success("Status updated");
      void qc.invalidateQueries({ queryKey: ["hr", "applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addRemark = useMutation({
    mutationFn: async () => {
      if (!remarkFor || !remarkBody.trim()) throw new Error("Remark cannot be empty");
      const { error } = await supabase.from("hr_remarks").insert({
        application_id: remarkFor,
        body: remarkBody.trim(),
        remark_type: remarkType,
        author_id: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Remark saved");
      setRemarkFor(null);
      setRemarkBody("");
      void qc.invalidateQueries({ queryKey: ["hr", "applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    return (data?.apps ?? []).filter(
      (a) =>
        (jobFilter === "all" || a.job_id === jobFilter) &&
        (statusFilter === "all" || a.status === statusFilter),
    );
  }, [data, jobFilter, statusFilter]);

  return (
    <HRLayout title="Applications" description="Track and progress every candidate application">
      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <Label>Job</Label>
          <select
            className="h-10 w-56 rounded-md border bg-background px-3 text-sm"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="all">All jobs</option>
            {(data?.jobs ?? []).map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Status</Label>
          <select
            className="h-10 w-44 rounded-md border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border bg-white p-6 text-muted-foreground shadow-sm">
            No applications match these filters.
          </p>
        ) : (
          rows.map((a) => {
            const job = (data?.jobs ?? []).find((j) => j.id === a.job_id);
            const cand = (data?.cands ?? []).find((c) => c.user_id === a.user_id);
            const remarks = (data?.remarks ?? []).filter((r) => r.application_id === a.id);
            return (
              <div key={a.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-extrabold text-navy">{cand?.full_name || "Candidate"}</p>
                    <p className="text-sm text-muted-foreground">
                      {cand?.email} · {cand?.contact_number || "no contact"}
                    </p>
                    <p className="mt-1 text-sm">
                      Applied for <span className="font-semibold">{job?.title ?? "Job"}</span> (
                      {job?.department}) on {formatDate(a.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status]}`}
                    >
                      {a.status}
                    </span>
                    <select
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={a.status}
                      onChange={(e) =>
                        setStatus.mutate({ id: a.id, status: e.target.value as ApplicationStatus })
                      }
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRemarkFor(a.id);
                        setRemarkBody("");
                      }}
                    >
                      <MessageSquarePlus className="mr-1 h-4 w-4" /> Note
                    </Button>
                  </div>
                </div>

                {a.cover_letter ? (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">{a.cover_letter}</p>
                ) : null}

                {remarks.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-t pt-3 text-sm">
                    {remarks.map((r) => (
                      <li key={r.id}>
                        <span className="font-semibold text-brand-dark">{r.remark_type}</span> ·{" "}
                        <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                        <p>{r.body}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!remarkFor} onOpenChange={(o) => !o && setRemarkFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add remark / interview note</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={remarkType}
                onChange={(e) => setRemarkType(e.target.value)}
              >
                <option>HR Remark</option>
                <option>Interview Note</option>
              </select>
            </div>
            <div>
              <Label htmlFor="rb">Note</Label>
              <Textarea
                id="rb"
                rows={5}
                value={remarkBody}
                onChange={(e) => setRemarkBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarkFor(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand hover:bg-brand-dark"
              onClick={() => addRemark.mutate()}
              disabled={addRemark.isPending}
            >
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
}
