import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Search, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { HRLayout } from "@/components/hr/HRLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadDocument } from "@/lib/candidate";
import { formatDate } from "@/lib/portal";

export const Route = createFileRoute("/hr/candidates")({
  head: () => ({
    meta: [
      { title: "Candidate Database — Secure Tech HR Portal" },
      {
        name: "description",
        content:
          "Search, filter and export the Secure Tech candidate database with skills, experience and documents.",
      },
      { property: "og:title", content: "Candidate Database — Secure Tech HR" },
      { property: "og:description", content: "Searchable candidate database with Excel export." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HRCandidates,
});

type Row = Record<string, any>;

const flatten = (obj: Record<string, string[]> | null | undefined) =>
  Object.values(obj ?? {}).flat().filter(Boolean);

function HRCandidates() {
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [minExp, setMinExp] = useState("");
  const [education, setEducation] = useState("");
  const [city, setCity] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["hr", "candidates"],
    queryFn: async () => {
      const [cands, edu, exp, docs, apps, jobs] = await Promise.all([
        supabase.from("candidates").select("*").order("full_name"),
        supabase.from("candidate_education").select("*"),
        supabase.from("candidate_experience").select("*"),
        supabase.from("candidate_documents").select("*"),
        supabase.from("applications").select("*"),
        supabase.from("jobs").select("id,title"),
      ]);
      return {
        candidates: (cands.data ?? []) as Row[],
        edu: edu.data ?? [],
        exp: exp.data ?? [],
        docs: docs.data ?? [],
        apps: apps.data ?? [],
        jobs: jobs.data ?? [],
      };
    },
  });

  const rows = useMemo(() => {
    const list = data?.candidates ?? [];
    return list.filter((c) => {
      const skills = [
        ...flatten(c.technical_skills),
        ...flatten(c.professional_skills),
      ].join(" ").toLowerCase();
      const eduRows = (data?.edu ?? []).filter((e) => e.user_id === c.user_id);
      const eduText = eduRows
        .map((e) => `${e.degree ?? ""} ${e.major ?? ""} ${e.institution ?? ""}`)
        .join(" ")
        .toLowerCase();
      if (q && !`${c.full_name ?? ""} ${c.email ?? ""} ${c.designation ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (skill && !skills.includes(skill.toLowerCase())) return false;
      if (minExp && Number(c.total_experience_years ?? 0) < Number(minExp)) return false;
      if (education && !eduText.includes(education.toLowerCase())) return false;
      if (city && !(c.current_city ?? "").toLowerCase().includes(city.toLowerCase())) return false;
      if (notice && !(c.notice_period ?? "").toLowerCase().includes(notice.toLowerCase()))
        return false;
      return true;
    });
  }, [data, q, skill, minExp, education, city, notice]);

  const exportExcel = () => {
    if (rows.length === 0) {
      toast.error("No candidates to export");
      return;
    }
    const sheet = rows.map((c) => ({
      "Full Name": c.full_name,
      Email: c.email,
      Contact: c.contact_number,
      CNIC: c.cnic,
      City: c.current_city,
      Designation: c.designation,
      "Experience (yrs)": c.total_experience_years,
      "Current Employer": c.current_employer,
      Education: (data?.edu ?? [])
        .filter((e) => e.user_id === c.user_id)
        .map((e) => `${e.degree ?? ""} ${e.major ?? ""} (${e.institution ?? ""})`)
        .join("; "),
      "Technical Skills": flatten(c.technical_skills).join(", "),
      "Professional Skills": flatten(c.professional_skills).join(", "),
      "Preferred Position": c.preferred_position,
      "Expected Salary": c.expected_salary,
      "Notice Period": c.notice_period,
      LinkedIn: c.linkedin_url,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet), "Candidates");
    XLSX.writeFile(wb, `securetech-candidates-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Candidate list exported");
  };

  const selDocs = (data?.docs ?? []).filter((d) => d.user_id === selected?.user_id);
  const selApps = (data?.apps ?? []).filter((a) => a.user_id === selected?.user_id);

  return (
    <HRLayout
      title="Candidate Database"
      description={`${rows.length} candidate${rows.length === 1 ? "" : "s"} matching filters`}
      actions={
        <Button className="bg-brand hover:bg-brand-dark" onClick={exportExcel}>
          <FileSpreadsheet className="mr-1 h-4 w-4" /> Export Excel
        </Button>
      }
    >
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email or designation"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label>Skill / certification</Label>
            <Input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. Python" />
          </div>
          <div>
            <Label>Min. experience (yrs)</Label>
            <Input type="number" min={0} value={minExp} onChange={(e) => setMinExp(e.target.value)} />
          </div>
          <div>
            <Label>Education</Label>
            <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="BS CS" />
          </div>
          <div>
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Islamabad" />
          </div>
          <div>
            <Label>Notice period</Label>
            <Input value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="1 month" />
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Experience</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">Notice</th>
              <th className="px-4 py-3">Resume</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                  No candidates match these filters.
                </td>
              </tr>
            ) : (
              rows.map((c) => {
                const resume = (data?.docs ?? []).find(
                  (d) => d.user_id === c.user_id && d.doc_type === "resume",
                );
                return (
                  <tr
                    key={c.user_id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelected(c)}
                  >
                    <td className="px-4 py-3 font-semibold text-navy">{c.full_name || "—"}</td>
                    <td className="px-4 py-3">{c.email || "—"}</td>
                    <td className="px-4 py-3">{c.current_city || "—"}</td>
                    <td className="px-4 py-3">{c.total_experience_years ?? "—"}</td>
                    <td className="px-4 py-3">{c.designation || "—"}</td>
                    <td className="px-4 py-3">{c.notice_period || "—"}</td>
                    <td className="px-4 py-3">
                      {resume ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            void downloadDocument(resume.storage_path, resume.file_name);
                          }}
                        >
                          <Download className="mr-1 h-3.5 w-3.5" /> CV
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.full_name || "Candidate"}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6 text-sm">
              <section>
                <h3 className="font-bold text-navy">Personal</h3>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {[
                    ["Email", selected.email],
                    ["Contact", selected.contact_number],
                    ["CNIC / Passport", selected.cnic],
                    ["Date of birth", selected.date_of_birth],
                    ["Gender", selected.gender],
                    ["City", selected.current_city],
                    ["LinkedIn", selected.linkedin_url],
                    ["Portfolio", selected.portfolio_url],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{(v as string) || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="font-bold text-navy">Experience & preferences</h3>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {[
                    ["Current employer", selected.current_employer],
                    ["Designation", selected.designation],
                    ["Total experience", selected.total_experience_years],
                    ["Industry experience", selected.industry_experience],
                    ["Preferred position", selected.preferred_position],
                    ["Preferred department", selected.preferred_department],
                    ["Employment type", selected.preferred_employment_type],
                    ["Expected salary", selected.expected_salary],
                    ["Notice period", selected.notice_period],
                    ["Availability", selected.availability_date],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{(v as string | number) ?? "—" || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="font-bold text-navy">Education</h3>
                <ul className="mt-2 space-y-1">
                  {(data?.edu ?? []).filter((e) => e.user_id === selected.user_id).map((e) => (
                    <li key={e.id}>
                      {e.degree} {e.major} — {e.institution} ({e.graduation_year}, {e.grade})
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-navy">Employment history</h3>
                <ul className="mt-2 space-y-1">
                  {(data?.exp ?? []).filter((e) => e.user_id === selected.user_id).map((e) => (
                    <li key={e.id}>
                      <span className="font-medium">{e.title}</span> at {e.company} ({e.start_date} –{" "}
                      {e.end_date || "present"})
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-navy">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[...flatten(selected.technical_skills), ...flatten(selected.professional_skills)].map(
                    (s, i) => (
                      <span key={i} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">
                        {s}
                      </span>
                    ),
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-bold text-navy">Documents</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selDocs.length === 0 ? (
                    <span className="text-muted-foreground">No documents uploaded.</span>
                  ) : (
                    selDocs.map((d) => (
                      <Button
                        key={d.id}
                        size="sm"
                        variant="outline"
                        onClick={() => void downloadDocument(d.storage_path, d.file_name)}
                      >
                        <Download className="mr-1 h-3.5 w-3.5" /> {d.file_name}
                      </Button>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-bold text-navy">Application history</h3>
                <ul className="mt-2 space-y-1">
                  {selApps.length === 0 ? (
                    <li className="text-muted-foreground">No applications.</li>
                  ) : (
                    selApps.map((a) => (
                      <li key={a.id}>
                        {(data?.jobs ?? []).find((j) => j.id === a.job_id)?.title ?? "Job"} —{" "}
                        <span className="font-semibold">{a.status}</span> · {formatDate(a.created_at)}
                      </li>
                    ))
                  )}
                </ul>
              </section>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
}
