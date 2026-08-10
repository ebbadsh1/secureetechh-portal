import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteLayout, PageBanner } from "@/components/site/SiteLayout";
import { RequireAuth } from "@/components/portal/RequireAuth";
import { Button } from "@/components/ui/button";
import { APPLICATION_STATUSES, STATUS_STYLES, formatDate, type ApplicationStatus } from "@/lib/portal";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Applications — Secure Tech Careers Portal" },
      {
        name: "description",
        content: "Track the status of every job application you submitted to Secure Tech Consultancy.",
      },
      { property: "og:title", content: "My Applications — Secure Tech Careers" },
      { property: "og:description", content: "Track your application status in real time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type Row = {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  jobs: { id: string; title: string; department: string; location: string } | null;
};

function DashboardPage() {
  return (
    <SiteLayout>
      <PageBanner
        title="My Applications"
        subtitle="Track where you stand in our hiring process."
        crumb="Dashboard"
      />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <RequireAuth>
          <Applications />
        </RequireAuth>
      </div>
    </SiteLayout>
  );
}

function Applications() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, status, created_at, jobs(id, title, department, location)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRows((data ?? []) as unknown as Row[]);
      setLoading(false);
    };
    void load();

    const channel = supabase
      .channel("my-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` },
        () => void load(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link to="/profile">Edit my profile & documents</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/careers">Browse open positions</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {APPLICATION_STATUSES.map((s) => (
          <div key={s} className="rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-extrabold text-navy">
              {rows.filter((r) => r.status === s).length}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            You haven't applied to any positions yet.
          </p>
          <Button asChild className="mt-4">
            <Link to="/careers">Explore careers</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-5"
            >
              <div>
                <h3 className="text-lg font-extrabold text-navy">JOB: {r.jobs?.title ?? "Position"}</h3>
                <p className="text-sm text-muted-foreground">
                  {r.jobs?.department} · Location: {r.jobs?.location}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Applied on {formatDate(r.created_at)}
                </p>
              </div>
              <span
                className={`ml-auto rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[r.status]}`}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
