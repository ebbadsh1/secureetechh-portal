import { useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Candidate Sign In — Secure Tech Careers Portal" },
      {
        name: "description",
        content:
          "Sign in or create a candidate account to apply for jobs at Secure Tech Consultancy, Islamabad.",
      },
      { property: "og:title", content: "Candidate Sign In — Secure Tech Careers" },
      { property: "og:description", content: "Create your candidate account and apply online." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const go = () => navigate({ to: (redirect as string) || "/dashboard" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    go();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ fullName, email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0]!.message);
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: parsed.data.fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      toast.success("Account created. Check your email to confirm your address.");
      setMode("login");
      return;
    }
    toast.success("Account created successfully");
    go();
  };

  const handleReset = async () => {
    if (!loginEmail.trim()) return toast.error("Enter your email address first");
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent to your email");
  };

  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <h1 className="text-center text-3xl font-extrabold text-navy">Candidate Portal</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Apply once, reuse your profile for every opening.
        </p>

        <Tabs value={mode} onValueChange={setMode} className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-border p-6">
              <div>
                <Label htmlFor="le">Email address</Label>
                <Input
                  id="le"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lp">Password</Label>
                <Input
                  id="lp"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign In"}
              </Button>
              <button
                type="button"
                onClick={() => void handleReset()}
                className="w-full text-sm text-brand hover:underline"
              >
                Forgot your password?
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 rounded-xl border border-border p-6">
              <div>
                <Label htmlFor="sn">Full name</Label>
                <Input id="sn" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="se">Email address</Label>
                <Input
                  id="se"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sp">Password</Label>
                <Input
                  id="sp"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">Minimum 8 characters.</p>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          HR staff member?{" "}
          <Link to="/hr-login" className="font-bold text-brand hover:underline">
            Use the HR login
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
