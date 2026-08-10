import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteLayout, PageBanner } from "@/components/site/SiteLayout";
import { RequireAuth } from "@/components/portal/RequireAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchCandidateBundle } from "@/lib/candidate";

export const Route = createFileRoute("/apply/$jobId")({
  head: () => ({
    meta: [
      { title: "Apply Online — Secure Tech Careers Portal" },
      {
        name: "description",
        content: "Submit your application for an open position at Secure Tech Consultancy, Islamabad.",
      },
      { property: "og:title", content: "Apply Online — Secure Tech Careers" },
      { property: "og:description", content: "Submit your application in one click." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  return (
    <SiteLayout>
      <PageBanner
        title="Submit Your Application"
        subtitle="Your saved profile and documents are attached automatically."
        crumb="Apply"
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <RequireAuth>
          <ApplyForm />
        </RequireAuth>
      </div>
    </SiteLayout>
  );
}

type Job = { id: string; title: string; department: string; employment_type: string; location: string };

function ApplyForm() {
  const { jobId } = useParams({ from: "/apply/$jobId" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [hasResume, setHasResume] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [already, setAlready] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [{ data: jobRow }, bundle, { data: existing }] = await Promise.all([
        supabase
          .from("jobs")
          .select("id, title, department, employment_type, location")
          .eq("id", jobId)
          .maybeSingle(),
        fetchCandidateBundle(user.id),
        supabase.from("applications").select("id").eq("job_id", jobId).eq("user_id", user.id).maybeSingle(),
      ]);
      setJob((jobRow as Job) ?? null);
      setHasResume(bundle.documents.some((d) => d.doc_type === "resume"));
      setProfileReady(Boolean(bundle.candidate?.full_name && bundle.candidate?.contact_number));
      setAlready(Boolean(existing));
      setLoading(false);
    })();
  }, [user, jobId]);

  const submit = async () => {
    if (!user || !job) return;
    if (!profileReady) {
      toast.error("Please complete your profile (name and contact number) first.");
      return;
    }
    if (!hasResume) {
      toast.error("Please upload your resume in the Documents step of your profile.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("applications").insert({
      job_id: job.id,
      user_id: user.id,
      cover_letter: coverLetter.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Your application for ${job.title} has been received.`);
    void navigate({ to: "/dashboard" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!job) {
    return <p className="text-center text-muted-foreground">This job posting is no longer available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-brand">{job.department}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-navy">JOB: {job.title}</h2>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-accent-red" /> Location: {job.location}
        </p>
      </div>

      {already ? (
        <div className="rounded-xl border border-border bg-brand-soft p-6 text-sm text-brand-dark">
          You have already applied to this position. Track its status on your{" "}
          <Link to="/dashboard" className="font-bold underline">
            dashboard
          </Link>
          .
        </div>
      ) : (
        <>
          {(!profileReady || !hasResume) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Before applying, finish your{" "}
              <Link to="/profile" className="font-bold underline">
                candidate profile
              </Link>
              {!hasResume ? " and upload your resume." : "."}
            </div>
          )}

          <div className="rounded-xl border border-border p-6">
            <Label className="text-sm font-semibold text-navy">Cover note (optional)</Label>
            <Textarea
              className="mt-2"
              rows={6}
              value={coverLetter}
              maxLength={2000}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us briefly why you are a great fit for this role."
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => void submit()} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit application"}
              </Button>
              <Button asChild variant="outline">
                <Link to="/profile">Edit my profile</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
