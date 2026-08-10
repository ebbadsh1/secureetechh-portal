import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageBanner, SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Secure Tech Consultancy, Islamabad" },
      {
        name: "description",
        content:
          "Get in touch with Secure Tech Consultancy (Pvt) Ltd in Islamabad for security, biometrics and recruitment enquiries.",
      },
      { property: "og:title", content: "Contact Secure Tech Consultancy" },
      { property: "og:description", content: "Reach our Islamabad office." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteLayout>
      <PageBanner title="Get In Touch With Our Team" crumb="Contact Us" />
      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-20 md:grid-cols-3 lg:px-6">
        {[
          { icon: MapPin, title: "Office", lines: ["Secure Tech Consultancy", "Islamabad, Pakistan"] },
          { icon: Phone, title: "Phone", lines: ["+92 51 000 0000"] },
          { icon: Mail, title: "Email", lines: ["info@securetech.com.pk", "careers@securetech.com.pk"] },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-border p-6">
            <c.icon className="h-7 w-7 text-brand" />
            <h2 className="mt-4 font-extrabold text-navy">{c.title}</h2>
            {c.lines.map((l) => (
              <p key={l} className="mt-1 text-sm text-slate-600">
                {l}
              </p>
            ))}
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
