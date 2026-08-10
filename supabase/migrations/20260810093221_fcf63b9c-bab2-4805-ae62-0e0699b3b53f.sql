
-- ROLES
CREATE TYPE public.app_role AS ENUM ('candidate','hr_staff','hr_admin');
CREATE TYPE public.application_status AS ENUM ('New','Shortlisted','Interviewed','Hired','Rejected');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_hr(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('hr_staff','hr_admin'))
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_hr(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_hr(auth.uid()));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'hr_admin')) WITH CHECK (public.has_role(auth.uid(),'hr_admin'));

-- signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'candidate')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.candidates (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- JOBS
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  employment_type text NOT NULL DEFAULT 'Full-time',
  location text NOT NULL DEFAULT 'Secure Tech Consultancy, Islamabad',
  description text NOT NULL DEFAULT '',
  responsibilities text NOT NULL DEFAULT '',
  requirements text NOT NULL DEFAULT '',
  openings int NOT NULL DEFAULT 1,
  posting_date date NOT NULL DEFAULT current_date,
  closing_date date,
  status text NOT NULL DEFAULT 'Open',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published jobs" ON public.jobs FOR SELECT TO anon, authenticated USING (published = true OR public.is_hr(auth.uid()));
CREATE POLICY "hr manage jobs" ON public.jobs FOR ALL TO authenticated USING (public.is_hr(auth.uid())) WITH CHECK (public.is_hr(auth.uid()));

-- CANDIDATES
CREATE TABLE public.candidates (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  cnic text,
  date_of_birth date,
  gender text,
  contact_number text,
  email text,
  current_city text,
  linkedin_url text,
  portfolio_url text,
  current_employer text,
  previous_employers text,
  designation text,
  total_experience_years numeric,
  industry_experience text,
  technical_skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  professional_skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferred_position text,
  preferred_department text,
  preferred_employment_type text,
  expected_salary text,
  notice_period text,
  preferred_location text,
  availability_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.candidates TO authenticated;
GRANT ALL ON public.candidates TO service_role;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidate own row" ON public.candidates FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "hr read candidates" ON public.candidates FOR SELECT TO authenticated USING (public.is_hr(auth.uid()));

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.candidate_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree text, major text, institution text, graduation_year text, grade text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_education TO authenticated;
GRANT ALL ON public.candidate_education TO service_role;
ALTER TABLE public.candidate_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own education" ON public.candidate_education FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "hr read education" ON public.candidate_education FOR SELECT TO authenticated USING (public.is_hr(auth.uid()));

CREATE TABLE public.candidate_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company text, title text, start_date text, end_date text, description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_experience TO authenticated;
GRANT ALL ON public.candidate_experience TO service_role;
ALTER TABLE public.candidate_experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own experience" ON public.candidate_experience FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "hr read experience" ON public.candidate_experience FOR SELECT TO authenticated USING (public.is_hr(auth.uid()));

CREATE TABLE public.candidate_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size int,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_documents TO authenticated;
GRANT ALL ON public.candidate_documents TO service_role;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own documents" ON public.candidate_documents FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "hr read documents" ON public.candidate_documents FOR SELECT TO authenticated USING (public.is_hr(auth.uid()));

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'New',
  cover_letter text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_hr(auth.uid()));
CREATE POLICY "candidate apply" ON public.applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "hr update applications" ON public.applications FOR UPDATE TO authenticated USING (public.is_hr(auth.uid())) WITH CHECK (public.is_hr(auth.uid()));
CREATE POLICY "hr delete applications" ON public.applications FOR DELETE TO authenticated USING (public.is_hr(auth.uid()));

CREATE TABLE public.application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status public.application_status NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.application_status_history TO authenticated;
GRANT ALL ON public.application_status_history TO service_role;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history read" ON public.application_status_history FOR SELECT TO authenticated USING (
  public.is_hr(auth.uid()) OR EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid())
);
CREATE POLICY "hr insert history" ON public.application_status_history FOR INSERT TO authenticated WITH CHECK (public.is_hr(auth.uid()));

CREATE TABLE public.hr_remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  remark_type text NOT NULL DEFAULT 'remark',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hr_remarks TO authenticated;
GRANT ALL ON public.hr_remarks TO service_role;
ALTER TABLE public.hr_remarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hr manage remarks" ON public.hr_remarks FOR ALL TO authenticated USING (public.is_hr(auth.uid())) WITH CHECK (public.is_hr(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;

INSERT INTO public.jobs (title, department, employment_type, description, responsibilities, requirements, openings, closing_date)
VALUES
('Finance Manager','Finance','Full-time','Secure Tech Consultancy is looking for an experienced Finance Manager to lead financial planning, reporting and compliance for a growing IT security and biometrics business.','Prepare monthly, quarterly and annual financial statements.
Manage budgeting, forecasting and cash flow planning.
Oversee taxation, audits and statutory compliance.
Supervise the accounts team and improve internal controls.','ACCA / CA / MBA Finance or equivalent.
Minimum 5 years of relevant experience.
Strong command of ERP and MS Excel.
Excellent analytical and leadership skills.',1, current_date + 45),
('Senior Cybersecurity Engineer','Cybersecurity','Full-time','Join our security operations team to design, deploy and defend enterprise-grade security infrastructure for national-level clients.','Design and implement network and endpoint security controls.
Run vulnerability assessments and penetration tests.
Monitor SIEM alerts and lead incident response.
Produce security posture reports for clients.','BS/MS in Computer Science or Cybersecurity.
4+ years hands-on security engineering experience.
CEH / OSCP / CISSP preferred.
Strong Linux, networking and scripting skills.',2, current_date + 30),
('Biometrics Software Engineer','Engineering','Full-time','Build and optimise biometric identification software used across large-scale identity programmes.','Develop and maintain biometric matching and enrolment modules.
Integrate fingerprint, facial and iris capture devices.
Optimise performance of matching pipelines.
Write unit and integration tests.','BS Computer Science or Software Engineering.
3+ years C++/C#/Java or Python experience.
Experience with image processing or SDK integration is a plus.',3, current_date + 60),
('Network Operations Intern','IT Operations','Internship','A six month paid internship for fresh graduates who want to start a career in enterprise networking and security operations.','Assist the NOC team with monitoring and ticketing.
Document network changes and configurations.
Support routine maintenance activities.','Recent graduate in CS / IT / Telecom.
Basic understanding of TCP/IP and routing.
CCNA in progress is a plus.',2, current_date + 20);
