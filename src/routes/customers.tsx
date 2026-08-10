import { createFileRoute } from "@tanstack/react-router";
import { PageBanner, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Our Customers — Secure Tech Consultancy" },
      {
        name: "description",
        content:
          "Banks, telecom operators, government agencies and enterprises across Pakistan trust Secure Tech Consultancy for security and biometrics.",
      },
      { property: "og:title", content: "Our Customers — Secure Tech Consultancy" },
      {
        property: "og:description",
        content: "Sectors and organisations we serve across Pakistan.",
      },
    ],
  }),
  component: Customers,
});

const SECTORS = [
  ["Banking & Finance", "Core banking security, fraud controls and biometric customer verification."],
  ["Telecommunications", "SIM registration, subscriber verification and network security."],
  ["Government & Public Sector", "National identity, border control and law-enforcement systems."],
  ["Healthcare", "Patient identity management and records protection."],
  ["Education", "Campus access control and examination identity verification."],
  ["Enterprise", "Workforce access, endpoint protection and compliance programmes."],
];

function Customers() {
  return (
    <SiteLayout>
      <PageBanner title="The Organisations We Serve" crumb="Our Customers" />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 md:grid-cols-2 lg:grid-cols-3 lg:px-6">
        {SECTORS.map(([title, text]) => (
          <div key={title} className="rounded-xl border-l-4 border-brand bg-slate-50 p-6">
            <h2 className="text-lg font-extrabold text-navy">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
