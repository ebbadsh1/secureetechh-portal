import { supabase } from "@/integrations/supabase/client";

export type Candidate = {
  user_id: string;
  full_name: string;
  cnic: string | null;
  date_of_birth: string | null;
  gender: string | null;
  contact_number: string | null;
  email: string | null;
  current_city: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  current_employer: string | null;
  previous_employers: string | null;
  designation: string | null;
  total_experience_years: number | null;
  industry_experience: string | null;
  technical_skills: Record<string, string[]>;
  professional_skills: Record<string, string[]>;
  preferred_position: string | null;
  preferred_department: string | null;
  preferred_employment_type: string | null;
  expected_salary: string | null;
  notice_period: string | null;
  preferred_location: string | null;
  availability_date: string | null;
};

export type EducationRow = {
  id?: string;
  degree: string;
  major: string;
  institution: string;
  graduation_year: string;
  grade: string;
};

export type ExperienceRow = {
  id?: string;
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string;
};

export type DocumentRow = {
  id: string;
  doc_type: string;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  created_at: string;
};

export const emptyEducation = (): EducationRow => ({
  degree: "",
  major: "",
  institution: "",
  graduation_year: "",
  grade: "",
});

export const emptyExperience = (): ExperienceRow => ({
  company: "",
  title: "",
  start_date: "",
  end_date: "",
  description: "",
});

export async function fetchCandidateBundle(userId: string) {
  const [cand, edu, exp, docs] = await Promise.all([
    supabase.from("candidates").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("candidate_education").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("candidate_experience").select("*").eq("user_id", userId).order("created_at"),
    supabase
      .from("candidate_documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);
  return {
    candidate: (cand.data ?? null) as Candidate | null,
    education: (edu.data ?? []) as EducationRow[],
    experience: (exp.data ?? []) as ExperienceRow[],
    documents: (docs.data ?? []) as DocumentRow[],
  };
}

export async function downloadDocument(path: string, fileName: string) {
  const { data, error } = await supabase.storage.from("candidate-documents").download(path);
  if (error || !data) throw error ?? new Error("Download failed");
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
