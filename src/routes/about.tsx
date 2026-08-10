import { createFileRoute } from "@tanstack/react-router";
import { PageBanner, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Secure Tech Consultancy (Pvt) Ltd" },
      {
        name: "description",
        content:
          "Secure Tech Consultancy is an Islamabad-based IT security and biometrics company serving enterprise and public-sector clients across Pakistan.",
      },
      { property: "og:title", content: "About Secure Tech Consultancy" },
      {
        property: "og:description",
        content: "An Islamabad-based IT security and biometrics company.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageBanner title="About Secure Tech Consultancy" crumb="About Us" />
      <section className="mx-auto max-w-4xl space-y-6 px-4 pb-20 text-slate-700 lg:px-6">
        <p className="text-lg leading-relaxed">
          Secure Tech Consultancy (Pvt) Ltd is an Islamabad-based technology company specialising in
          information security, biometric identification and identity management. Since our
          founding we have delivered mission-critical systems for banks, telecom operators, law
          enforcement agencies and national identity programmes.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ["15+", "Years of engineering experience"],
            ["120+", "Enterprise & government deployments"],
            ["24/7", "Security operations coverage"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-slate-50 p-6">
              <div className="text-3xl font-extrabold text-brand">{k}</div>
              <div className="mt-1 text-sm">{v}</div>
            </div>
          ))}
        </div>
        <h2 className="pt-4 text-2xl font-extrabold text-navy">Our Mission</h2>
        <p className="leading-relaxed">
          To protect the digital identity and infrastructure of our clients with engineering that is
          rigorous, auditable and locally supported — from our offices in Islamabad.
        </p>
      </section>
    </SiteLayout>
  );
}
