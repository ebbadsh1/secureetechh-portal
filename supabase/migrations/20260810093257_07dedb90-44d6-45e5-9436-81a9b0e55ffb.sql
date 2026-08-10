
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_hr(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_hr(uuid) TO authenticated;

DROP POLICY "public read published jobs" ON public.jobs;
CREATE POLICY "anon read published jobs" ON public.jobs FOR SELECT TO anon USING (published = true);
CREATE POLICY "auth read jobs" ON public.jobs FOR SELECT TO authenticated USING (published = true OR public.is_hr(auth.uid()));
