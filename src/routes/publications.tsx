import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageBanner, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/publications")({
  head: () => ({
    meta: [
      { title: "Publications & Insights — Secure Tech Consultancy" },
      {
        name: "description",
        content:
          "White papers, advisories and research notes on biometrics, cybersecurity and identity management from Secure Tech Consultancy, Islamabad.",
      },
      { property: "og:title", content: "Publications — Secure Tech Consultancy" },
      {
        property: "og:description",
        content: "White papers and advisories on biometrics and cybersecurity.",
      },
    ],
  }),
  component: Publications,
});

const PAPERS = [
  ["Biometric De-duplication at National Scale", "Technical white paper", "2025"],
  ["Zero Trust Adoption for Pakistani Enterprises", "Advisory note", "2025"],
  ["Securing SIM Registration Workflows", "Case study", "2024"],
  ["Practical SOC Maturity Models", "Research note", "2024"],
];

function Publications() {
  return (
    <SiteLayout>
      <PageBanner title="Publications & Research" crumb="Publications" />
      <section className="mx-auto max-w-4xl space-y-4 px-4 pb-20 lg:px-6">
        {PAPERS.map(([title, kind, year]) => (
          <article
            key={title}
            className="flex items-start gap-4 rounded-xl border border-border p-6 transition-colors hover:border-brand"
          >
            <FileText className="mt-1 h-6 w-6 shrink-0 text-accent-red" />
            <div>
              <h2 className="font-extrabold text-navy">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {kind} · {year}
              </p>
            </div>
          </article>
        ))}
      </section>
    </SiteLayout>
  );
}
