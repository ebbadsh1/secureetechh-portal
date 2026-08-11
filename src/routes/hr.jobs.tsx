import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COMPANY_LOCATION, DEPARTMENTS, EMPLOYMENT_TYPES, formatDate } from "@/lib/portal";

export const Route = createFileRoute("/hr/jobs")({
  head: () => ({
    meta: [
      { title: "Job Postings — Secure Tech HR Portal" },
      {
        name: "description",
        content: "Create, edit, publish and close job postings for Secure Tech Consultancy.",
      },
      { property: "og:title", content: "Job Postings — Secure Tech HR" },
      { property: "og:description", content: "Manage recruitment job postings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HRJobs,
});

type JobForm = {
  id?: string;
  title: string;
  department: string;
  employment_type: string;
  description: string;
  responsibilities: string;
  requirements: string;
  openings: number;
  posting_date: string;
  closing_date: string;
  status: string;
  published: boolean;
};

const empty = (): JobForm => ({
  title: "",
  department: DEPARTMENTS[0],
  employment_type: EMPLOYMENT_TYPES[0],
  description: "",
  responsibilities: "",
  requirements: "",
  openings: 1,
  posting_date: new Date().toISOString().slice(0, 10),
  closing_date: "",
  status: "Open",
  published: true,
});

function HRJobs() {
  const qc = useQueryClient();
  const [form, setForm] = useState<JobForm | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["hr", "jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("posting_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (f: JobForm) => {
      const payload = {
        title: f.title.trim(),
        department: f.department,
        employment_type: f.employment_type,
        location: COMPANY_LOCATION,
        description: f.description,
        responsibilities: f.responsibilities,
        requirements: f.requirements,
        openings: Number(f.openings) || 1,
        posting_date: f.posting_date,
        closing_date: f.closing_date || null,
        status: f.status,
        published: f.published,
      };
      const { error } = f.id
        ? await supabase.from("jobs").update(payload).eq("id", f.id)
        : await supabase.from("jobs").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posting saved");
      setForm(null);
      void qc.invalidateQueries({ queryKey: ["hr", "jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posting deleted");
      void qc.invalidateQueries({ queryKey: ["hr", "jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("jobs").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Publication status updated");
      void qc.invalidateQueries({ queryKey: ["hr", "jobs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <HRLayout
      title="Job Postings"
      description="Create and manage open positions"
      actions={
        <Button className="bg-brand hover:bg-brand-dark" onClick={() => setForm(empty())}>
          <Plus className="mr-1 h-4 w-4" /> New job
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Posted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                  No job postings yet.
                </td>
              </tr>
            ) : (
              jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-navy">{j.title}</td>
                  <td className="px-4 py-3">{j.department}</td>
                  <td className="px-4 py-3">{j.employment_type}</td>
                  <td className="px-4 py-3">{formatDate(j.posting_date)}</td>
                  <td className="px-4 py-3">{j.status}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={j.published}
                      onCheckedChange={(v) => togglePublish.mutate({ id: j.id, published: v })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Edit job"
                        onClick={() =>
                          setForm({
                            id: j.id,
                            title: j.title,
                            department: j.department,
                            employment_type: j.employment_type,
                            description: j.description ?? "",
                            responsibilities: j.responsibilities ?? "",
                            requirements: j.requirements ?? "",
                            openings: j.openings ?? 1,
                            posting_date: j.posting_date?.slice(0, 10) ?? "",
                            closing_date: j.closing_date?.slice(0, 10) ?? "",
                            status: j.status,
                            published: j.published,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Delete job"
                        onClick={() => {
                          if (confirm(`Delete "${j.title}"? This cannot be undone.`))
                            remove.mutate(j.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit job posting" : "New job posting"}</DialogTitle>
          </DialogHeader>
          {form ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.title.trim()) {
                  toast.error("Job title is required");
                  return;
                }
                save.mutate(form);
              }}
            >
              <div>
                <Label htmlFor="jt">Job title</Label>
                <Input
                  id="jt"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="jd">Department</Label>
                  <select
                    id="jd"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="je">Employment type</Label>
                  <select
                    id="je"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.employment_type}
                    onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input value={COMPANY_LOCATION} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label htmlFor="jdesc">Description</Label>
                <Textarea
                  id="jdesc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="jres">Responsibilities (one per line)</Label>
                <Textarea
                  id="jres"
                  rows={4}
                  value={form.responsibilities}
                  onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="jreq">Requirements (one per line)</Label>
                <Textarea
                  id="jreq"
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="jo">Openings</Label>
                  <Input
                    id="jo"
                    type="number"
                    min={1}
                    value={form.openings}
                    onChange={(e) => setForm({ ...form, openings: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="jp">Posting date</Label>
                  <Input
                    id="jp"
                    type="date"
                    value={form.posting_date}
                    onChange={(e) => setForm({ ...form, posting_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="jc">Closing date</Label>
                  <Input
                    id="jc"
                    type="date"
                    value={form.closing_date}
                    onChange={(e) => setForm({ ...form, closing_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <Label htmlFor="js">Status</Label>
                  <select
                    id="js"
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Open</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={form.published}
                    onCheckedChange={(v) => setForm({ ...form, published: v })}
                  />
                  <span className="text-sm font-medium">Published on careers site</span>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setForm(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand hover:bg-brand-dark" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save job"}
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
}
