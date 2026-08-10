import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageBanner } from "@/components/site/SiteLayout";
import { RequireAuth } from "@/components/portal/RequireAuth";
import { ProfileEditor } from "@/components/portal/ProfileEditor";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Candidate Profile — Secure Tech Careers Portal" },
      {
        name: "description",
        content:
          "Maintain your education, experience, skills and documents once and reuse them for every Secure Tech application.",
      },
      { property: "og:title", content: "My Candidate Profile — Secure Tech Careers" },
      { property: "og:description", content: "Manage your candidate profile and documents." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <SiteLayout>
      <PageBanner
        title="My Candidate Profile"
        subtitle="Complete your profile once — then apply to any opening in a single click."
        breadcrumb={["Home", "Careers", "Profile"]}
      />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <RequireAuth>
          <ProfileEditor />
        </RequireAuth>
      </div>
    </SiteLayout>
  );
}
