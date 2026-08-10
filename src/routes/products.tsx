import { createFileRoute } from "@tanstack/react-router";
import { Fingerprint, KeyRound, ScanFace, ServerCog, ShieldCheck, Siren } from "lucide-react";
import { PageBanner, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Secure Tech Consultancy Security & Biometrics" },
      {
        name: "description",
        content:
          "Biometric identification, identity management, SOC monitoring and enterprise security products from Secure Tech Consultancy, Islamabad.",
      },
      { property: "og:title", content: "Products — Secure Tech Consultancy" },
      {
        property: "og:description",
        content: "Biometrics, identity management and enterprise security products.",
      },
    ],
  }),
  component: Products,
});

const PRODUCTS = [
  { icon: Fingerprint, title: "STC BioMatch", text: "Multi-modal biometric matching engine for fingerprint, face and iris at national scale." },
  { icon: ScanFace, title: "STC Enrol", text: "Field and kiosk enrolment suite with device SDK integration and offline sync." },
  { icon: KeyRound, title: "STC Identity Gateway", text: "Federated identity, MFA and single sign-on for enterprise applications." },
  { icon: Siren, title: "STC SOC Sentinel", text: "SIEM-driven monitoring, alert triage and automated incident workflows." },
  { icon: ShieldCheck, title: "STC Assure", text: "Vulnerability assessment, penetration testing and compliance reporting." },
  { icon: ServerCog, title: "STC Secure Infrastructure", text: "Hardened network, endpoint and data-centre security deployments." },
];

function Products() {
  return (
    <SiteLayout>
      <PageBanner title="Security & Biometrics Products" crumb="Products" />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 md:grid-cols-2 lg:grid-cols-3 lg:px-6">
        {PRODUCTS.map((p) => (
          <div key={p.title} className="rounded-xl border border-border p-6 transition-colors hover:border-brand">
            <p.icon className="h-8 w-8 text-brand" />
            <h2 className="mt-4 text-lg font-extrabold text-navy">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
