import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function RequireAuth({
  children,
  hrOnly = false,
}: {
  children: ReactNode;
  hrOnly?: boolean;
}) {
  const { session, loading, isHR } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void navigate({ to: hrOnly ? "/hr-login" : "/auth" });
      return;
    }
    if (hrOnly && !isHR) void navigate({ to: "/dashboard" });
  }, [loading, session, isHR, hrOnly, navigate]);

  if (loading || !session || (hrOnly && !isHR)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return <>{children}</>;
}
