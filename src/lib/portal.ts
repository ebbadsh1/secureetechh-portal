export const COMPANY_LOCATION = "Secure Tech Consultancy, Islamabad";

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

export const DEPARTMENTS = [
  "Engineering",
  "Cybersecurity",
  "IT Operations",
  "Finance",
  "Human Resources",
  "Sales & Marketing",
  "Project Management",
] as const;

export const APPLICATION_STATUSES = [
  "New",
  "Shortlisted",
  "Interviewed",
  "Hired",
  "Rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  New: "bg-slate-100 text-slate-700 border-slate-200",
  Shortlisted: "bg-amber-50 text-amber-700 border-amber-200",
  Interviewed: "bg-blue-50 text-blue-700 border-blue-200",
  Hired: "bg-brand-soft text-brand-dark border-brand/40",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export const TECHNICAL_SKILL_GROUPS = [
  ["programming_languages", "Programming Languages"],
  ["frameworks", "Frameworks"],
  ["databases", "Databases"],
  ["operating_systems", "Operating Systems"],
  ["networking", "Networking"],
  ["cybersecurity", "Cybersecurity"],
  ["cloud_platforms", "Cloud Platforms"],
  ["software_tools", "Software Tools"],
  ["certifications", "Certifications"],
] as const;

export const PROFESSIONAL_SKILL_GROUPS = [
  ["project_management", "Project Management"],
  ["leadership", "Leadership"],
  ["communication", "Communication"],
  ["languages", "Languages"],
  ["other", "Other Competencies"],
] as const;

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const RESUME_TYPES = [".pdf", ".doc", ".docx"];

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function validateFile(file: File, allowed?: string[]) {
  if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than 5MB.`;
  if (allowed) {
    const ok = allowed.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!ok) return `${file.name} must be one of: ${allowed.join(", ")}`;
  }
  return null;
}

export const CNIC_REGEX = /^\d{5}-?\d{7}-?\d$/;
export const PHONE_REGEX = /^(\+92|0)?3\d{2}-?\d{7}$/;
