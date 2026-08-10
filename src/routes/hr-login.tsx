import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/hr-login")({
  head: () => ({
    meta: [
      { title: "HR Login — Secure Tech Recruitment Administration" },
      {
        name: "description",
        content:
          "Secure login for Secure Tech Consultancy HR staff to manage job postings, candidates and applications.",
      },
      { property: "og:title", content: "HR Login — Secure Tech Recruitment" },
      { property: "og:description", content: "Restricted access for HR staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HRLogin,
});

function HRLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setBusy(false);
      { toast.error(error.message); return; }
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isHR = (roles ?? []).some((r) => r.role === "hr_admin" || r.role === "hr_staff");
    setBusy(false);
    if (!isHR) {
      await supabase.auth.signOut();
      { toast.error("This account does not have HR access."); return; }
    }
    toast.success("Signed in to the HR portal");
    navigate({ to: "/hr" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mt-8 flex items-center gap-2 text-brand">
          <ShieldCheck className="h-5 w-5" />
          <h1 className="text-xl font-extrabold text-navy">HR Administration Login</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Restricted area. HR accounts are created by an administrator only.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="he">Work email</Label>
            <Input
              id="he"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hr.admin@securetech.com.pk"
            />
          </div>
          <div>
            <Label htmlFor="hp">Password</Label>
            <Input
              id="hp"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-navy hover:bg-navy/90" disabled={busy}>
            {busy ? "Signing in…" : "Sign in to HR Portal"}
          </Button>
        </form>
        <a href="/" className="mt-6 block text-center text-sm text-muted-foreground hover:text-brand">
          ← Back to the website
        </a>
      </div>
    </div>
  );
}
