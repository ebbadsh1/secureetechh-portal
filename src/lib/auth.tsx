import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "candidate" | "hr_staff" | "hr_admin";

type AuthValue = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  isHR: boolean;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  roles: [],
  isHR: false,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesReady, setRolesReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;

    const loadRoles = async (userId: string | undefined) => {
      if (!userId) {
        if (active) {
          setRoles([]);
          setRolesReady(true);
        }
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (active) {
        setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
        setRolesReady(true);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setRolesReady(false);
      setTimeout(() => void loadRoles(newSession?.user?.id), 0);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadRoles(data.session?.user?.id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      roles,
      isHR: roles.includes("hr_admin") || roles.includes("hr_staff"),
      isAdmin: roles.includes("hr_admin"),
      loading: loading || !rolesReady,
      signOut: async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
      },
    }),
    [session, roles, loading, rolesReady, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
