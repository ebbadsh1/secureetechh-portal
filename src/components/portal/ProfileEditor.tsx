import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Download, Upload, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  COMPANY_LOCATION,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  PROFESSIONAL_SKILL_GROUPS,
  TECHNICAL_SKILL_GROUPS,
  CNIC_REGEX,
  PHONE_REGEX,
  RESUME_TYPES,
  validateFile,
  formatDate,
} from "@/lib/portal";
import {
  emptyEducation,
  emptyExperience,
  fetchCandidateBundle,
  downloadDocument,
  type Candidate,
  type DocumentRow,
  type EducationRow,
  type ExperienceRow,
} from "@/lib/candidate";
import { TagInput } from "@/components/portal/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STEPS = [
  "Personal",
  "Education",
  "Experience",
  "Technical Skills",
  "Professional Skills",
  "Preferences",
  "Documents",
];

const blank: Candidate = {
  user_id: "",
  full_name: "",
  cnic: null,
  date_of_birth: null,
  gender: null,
  contact_number: null,
  email: null,
  current_city: null,
  linkedin_url: null,
  portfolio_url: null,
  current_employer: null,
  previous_employers: null,
  designation: null,
  total_experience_years: null,
  industry_experience: null,
  technical_skills: {},
  professional_skills: {},
  preferred_position: null,
  preferred_department: null,
  preferred_employment_type: null,
  expected_salary: null,
  notice_period: null,
  preferred_location: COMPANY_LOCATION,
  availability_date: null,
};

export function ProfileEditor({ onSaved }: { onSaved?: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [c, setC] = useState<Candidate>(blank);
  const [education, setEducation] = useState<EducationRow[]>([emptyEducation()]);
  const [experience, setExperience] = useState<ExperienceRow[]>([emptyExperience()]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const bundle = await fetchCandidateBundle(user.id);
      setC({
        ...blank,
        ...(bundle.candidate ?? {}),
        user_id: user.id,
        email: bundle.candidate?.email ?? user.email ?? "",
        technical_skills: bundle.candidate?.technical_skills ?? {},
        professional_skills: bundle.candidate?.professional_skills ?? {},
      });
      setEducation(bundle.education.length ? bundle.education : [emptyEducation()]);
      setExperience(bundle.experience.length ? bundle.experience : [emptyExperience()]);
      setDocuments(bundle.documents);
      setLoading(false);
    })();
  }, [user]);

  const set = (patch: Partial<Candidate>) => setC((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    if (!c.full_name?.trim()) return "Full name is required";
    if (!c.email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) return "A valid email is required";
    if (!c.contact_number?.trim() || !PHONE_REGEX.test(c.contact_number.trim()))
      return "Enter a valid Pakistani mobile number (e.g. 03001234567)";
    if (c.cnic && c.cnic.trim() && !CNIC_REGEX.test(c.cnic.trim()))
      return "CNIC must look like 12345-1234567-1";
    return null;
  };

  const save = async () => {
    if (!user) return;
    const problem = validate();
    if (problem) {
      toast.error(problem);
      setStep(0);
      return;
    }
    setSaving(true);
    const payload = { ...c, user_id: user.id, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("candidates").upsert(payload, { onConflict: "user_id" });
    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    const eduRows = education
      .filter((e) => e.degree.trim() || e.institution.trim())
      .map((e) => ({
        user_id: user.id,
        degree: e.degree,
        major: e.major,
        institution: e.institution,
        graduation_year: e.graduation_year,
        grade: e.grade,
      }));
    const expRows = experience
      .filter((e) => e.company.trim() || e.title.trim())
      .map((e) => ({
        user_id: user.id,
        company: e.company,
        title: e.title,
        start_date: e.start_date,
        end_date: e.end_date,
        description: e.description,
      }));

    await supabase.from("candidate_education").delete().eq("user_id", user.id);
    await supabase.from("candidate_experience").delete().eq("user_id", user.id);
    if (eduRows.length) await supabase.from("candidate_education").insert(eduRows);
    if (expRows.length) await supabase.from("candidate_experience").insert(expRows);

    setSaving(false);
    toast.success("Profile saved successfully");
    onSaved?.();
  };

  const upload = async (docType: string, files: FileList | null, allowed?: string[]) => {
    if (!user || !files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const problem = validateFile(file, allowed);
      if (problem) {
        toast.error(problem);
        continue;
      }
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await supabase.storage.from("candidate-documents").upload(path, file);
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data, error: dbError } = await supabase
        .from("candidate_documents")
        .insert({
          user_id: user.id,
          doc_type: docType,
          file_name: file.name,
          storage_path: path,
          file_size: file.size,
        })
        .select()
        .single();
      if (dbError) toast.error(dbError.message);
      else {
        setDocuments((prev) => [data as DocumentRow, ...prev]);
        toast.success(`${file.name} uploaded`);
      }
    }
    setUploading(false);
  };

  const removeDoc = async (doc: DocumentRow) => {
    await supabase.storage.from("candidate-documents").remove([doc.storage_path]);
    await supabase.from("candidate_documents").delete().eq("id", doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Document removed");
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              i === step
                ? "bg-brand text-white"
                : "border border-border bg-white text-muted-foreground hover:text-navy"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name *">
              <Input value={c.full_name ?? ""} onChange={(e) => set({ full_name: e.target.value })} />
            </Field>
            <Field label="CNIC / Passport">
              <Input
                value={c.cnic ?? ""}
                placeholder="12345-1234567-1"
                onChange={(e) => set({ cnic: e.target.value })}
              />
            </Field>
            <Field label="Date of birth">
              <Input
                type="date"
                value={c.date_of_birth ?? ""}
                onChange={(e) => set({ date_of_birth: e.target.value || null })}
              />
            </Field>
            <Field label="Gender">
              <Select value={c.gender ?? ""} onValueChange={(v) => set({ gender: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Male", "Female", "Prefer not to say"].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Contact number *">
              <Input
                value={c.contact_number ?? ""}
                placeholder="03001234567"
                onChange={(e) => set({ contact_number: e.target.value })}
              />
            </Field>
            <Field label="Email address *">
              <Input type="email" value={c.email ?? ""} onChange={(e) => set({ email: e.target.value })} />
            </Field>
            <Field label="Current city">
              <Input
                value={c.current_city ?? ""}
                onChange={(e) => set({ current_city: e.target.value })}
              />
            </Field>
            <Field label="LinkedIn profile URL">
              <Input
                value={c.linkedin_url ?? ""}
                placeholder="https://linkedin.com/in/…"
                onChange={(e) => set({ linkedin_url: e.target.value })}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <Repeatable
            title="Education"
            rows={education}
            onAdd={() => setEducation((r) => [...r, emptyEducation()])}
            onRemove={(i) => setEducation((r) => r.filter((_, x) => x !== i))}
            render={(row, i) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Degree">
                  <Input
                    value={row.degree}
                    onChange={(e) =>
                      setEducation((r) => r.map((x, ix) => (ix === i ? { ...x, degree: e.target.value } : x)))
                    }
                  />
                </Field>
                <Field label="Major / Specialization">
                  <Input
                    value={row.major}
                    onChange={(e) =>
                      setEducation((r) => r.map((x, ix) => (ix === i ? { ...x, major: e.target.value } : x)))
                    }
                  />
                </Field>
                <Field label="Institution">
                  <Input
                    value={row.institution}
                    onChange={(e) =>
                      setEducation((r) =>
                        r.map((x, ix) => (ix === i ? { ...x, institution: e.target.value } : x)),
                      )
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Graduation year">
                    <Input
                      value={row.graduation_year}
                      onChange={(e) =>
                        setEducation((r) =>
                          r.map((x, ix) => (ix === i ? { ...x, graduation_year: e.target.value } : x)),
                        )
                      }
                    />
                  </Field>
                  <Field label="CGPA / %">
                    <Input
                      value={row.grade}
                      onChange={(e) =>
                        setEducation((r) => r.map((x, ix) => (ix === i ? { ...x, grade: e.target.value } : x)))
                      }
                    />
                  </Field>
                </div>
              </div>
            )}
          />
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Portfolio / GitHub URL">
                <Input
                  value={c.portfolio_url ?? ""}
                  onChange={(e) => set({ portfolio_url: e.target.value })}
                />
              </Field>
              <Field label="Current employer">
                <Input
                  value={c.current_employer ?? ""}
                  onChange={(e) => set({ current_employer: e.target.value })}
                />
              </Field>
              <Field label="Previous employers">
                <Input
                  value={c.previous_employers ?? ""}
                  onChange={(e) => set({ previous_employers: e.target.value })}
                />
              </Field>
              <Field label="Designation">
                <Input
                  value={c.designation ?? ""}
                  onChange={(e) => set({ designation: e.target.value })}
                />
              </Field>
              <Field label="Total years of experience">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={c.total_experience_years ?? ""}
                  onChange={(e) =>
                    set({ total_experience_years: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </Field>
              <Field label="Relevant industry experience">
                <Input
                  value={c.industry_experience ?? ""}
                  onChange={(e) => set({ industry_experience: e.target.value })}
                />
              </Field>
            </div>

            <Repeatable
              title="Employment history"
              rows={experience}
              onAdd={() => setExperience((r) => [...r, emptyExperience()])}
              onRemove={(i) => setExperience((r) => r.filter((_, x) => x !== i))}
              render={(row, i) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Company">
                    <Input
                      value={row.company}
                      onChange={(e) =>
                        setExperience((r) =>
                          r.map((x, ix) => (ix === i ? { ...x, company: e.target.value } : x)),
                        )
                      }
                    />
                  </Field>
                  <Field label="Job title">
                    <Input
                      value={row.title}
                      onChange={(e) =>
                        setExperience((r) => r.map((x, ix) => (ix === i ? { ...x, title: e.target.value } : x)))
                      }
                    />
                  </Field>
                  <Field label="Start date">
                    <Input
                      type="month"
                      value={row.start_date}
                      onChange={(e) =>
                        setExperience((r) =>
                          r.map((x, ix) => (ix === i ? { ...x, start_date: e.target.value } : x)),
                        )
                      }
                    />
                  </Field>
                  <Field label="End date">
                    <Input
                      type="month"
                      value={row.end_date}
                      onChange={(e) =>
                        setExperience((r) =>
                          r.map((x, ix) => (ix === i ? { ...x, end_date: e.target.value } : x)),
                        )
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <Textarea
                        rows={3}
                        value={row.description}
                        onChange={(e) =>
                          setExperience((r) =>
                            r.map((x, ix) => (ix === i ? { ...x, description: e.target.value } : x)),
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {TECHNICAL_SKILL_GROUPS.map(([key, label]) => (
              <TagInput
                key={key}
                label={label}
                values={c.technical_skills?.[key] ?? []}
                onChange={(next) =>
                  set({ technical_skills: { ...(c.technical_skills ?? {}), [key]: next } })
                }
              />
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {PROFESSIONAL_SKILL_GROUPS.map(([key, label]) => (
              <TagInput
                key={key}
                label={label}
                values={c.professional_skills?.[key] ?? []}
                onChange={(next) =>
                  set({ professional_skills: { ...(c.professional_skills ?? {}), [key]: next } })
                }
              />
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preferred position">
              <Input
                value={c.preferred_position ?? ""}
                onChange={(e) => set({ preferred_position: e.target.value })}
              />
            </Field>
            <Field label="Department">
              <Select
                value={c.preferred_department ?? ""}
                onValueChange={(v) => set({ preferred_department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Employment type">
              <Select
                value={c.preferred_employment_type ?? ""}
                onValueChange={(v) => set({ preferred_employment_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Expected salary (PKR)">
              <Input
                value={c.expected_salary ?? ""}
                onChange={(e) => set({ expected_salary: e.target.value })}
              />
            </Field>
            <Field label="Notice period">
              <Input
                value={c.notice_period ?? ""}
                placeholder="e.g. 30 days"
                onChange={(e) => set({ notice_period: e.target.value })}
              />
            </Field>
            <Field label="Preferred location">
              <Input
                value={c.preferred_location ?? ""}
                onChange={(e) => set({ preferred_location: e.target.value })}
              />
            </Field>
            <Field label="Availability date">
              <Input
                type="date"
                value={c.availability_date ?? ""}
                onChange={(e) => set({ availability_date: e.target.value || null })}
              />
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <UploadRow
              label="Resume / CV (PDF, DOC, DOCX — required)"
              onPick={(files) => void upload("resume", files, RESUME_TYPES)}
              accept=".pdf,.doc,.docx"
              busy={uploading}
            />
            <UploadRow
              label="Cover letter (optional)"
              onPick={(files) => void upload("cover_letter", files)}
              accept=".pdf,.doc,.docx"
              busy={uploading}
            />
            <UploadRow
              label="Academic certificates (optional, multiple)"
              onPick={(files) => void upload("academic", files)}
              multiple
              busy={uploading}
            />
            <UploadRow
              label="Professional certifications (optional, multiple)"
              onPick={(files) => void upload("certification", files)}
              multiple
              busy={uploading}
            />

            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-4 py-2 text-sm font-bold text-navy">
                Uploaded documents
              </div>
              {documents.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {documents.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                      <span className="font-semibold text-navy">{d.file_name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {d.doc_type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(d.created_at)}</span>
                      <div className="ml-auto flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void downloadDocument(d.storage_path, d.file_name).catch(() =>
                              toast.error("Could not download file"),
                            )
                          }
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void removeDoc(d)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </Button>
        <Button
          variant="outline"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => s + 1)}
        >
          Next
        </Button>
        <Button className="ml-auto" onClick={() => void save()} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-semibold text-navy">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Repeatable<T>({
  title,
  rows,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  rows: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (row: T, index: number) => ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-navy">{title}</h3>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="relative rounded-lg border border-border p-4">
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute right-3 top-3 text-destructive"
              aria-label="Remove entry"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {render(row, i)}
        </div>
      ))}
    </div>
  );
}

function UploadRow({
  label,
  onPick,
  accept,
  multiple,
  busy,
}: {
  label: string;
  onPick: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
  busy: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-navy">
        <Upload className="h-4 w-4 text-brand" />
        {label}
      </div>
      <Input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={busy}
        className="max-w-xs"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
