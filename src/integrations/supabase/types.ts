export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      application_status_history: {
        Row: {
          application_id: string
          changed_at: string
          changed_by: string | null
          id: string
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          status: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string
          file_size: number | null
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_name: string
          file_size?: number | null
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string
          file_size?: number | null
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_education: {
        Row: {
          created_at: string
          degree: string | null
          grade: string | null
          graduation_year: string | null
          id: string
          institution: string | null
          major: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          grade?: string | null
          graduation_year?: string | null
          id?: string
          institution?: string | null
          major?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          grade?: string | null
          graduation_year?: string | null
          id?: string
          institution?: string | null
          major?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidate_experience: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
          availability_date: string | null
          cnic: string | null
          contact_number: string | null
          current_city: string | null
          current_employer: string | null
          date_of_birth: string | null
          designation: string | null
          email: string | null
          expected_salary: string | null
          full_name: string
          gender: string | null
          industry_experience: string | null
          linkedin_url: string | null
          notice_period: string | null
          portfolio_url: string | null
          preferred_department: string | null
          preferred_employment_type: string | null
          preferred_location: string | null
          preferred_position: string | null
          previous_employers: string | null
          professional_skills: Json
          technical_skills: Json
          total_experience_years: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_date?: string | null
          cnic?: string | null
          contact_number?: string | null
          current_city?: string | null
          current_employer?: string | null
          date_of_birth?: string | null
          designation?: string | null
          email?: string | null
          expected_salary?: string | null
          full_name?: string
          gender?: string | null
          industry_experience?: string | null
          linkedin_url?: string | null
          notice_period?: string | null
          portfolio_url?: string | null
          preferred_department?: string | null
          preferred_employment_type?: string | null
          preferred_location?: string | null
          preferred_position?: string | null
          previous_employers?: string | null
          professional_skills?: Json
          technical_skills?: Json
          total_experience_years?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_date?: string | null
          cnic?: string | null
          contact_number?: string | null
          current_city?: string | null
          current_employer?: string | null
          date_of_birth?: string | null
          designation?: string | null
          email?: string | null
          expected_salary?: string | null
          full_name?: string
          gender?: string | null
          industry_experience?: string | null
          linkedin_url?: string | null
          notice_period?: string | null
          portfolio_url?: string | null
          preferred_department?: string | null
          preferred_employment_type?: string | null
          preferred_location?: string | null
          preferred_position?: string | null
          previous_employers?: string | null
          professional_skills?: Json
          technical_skills?: Json
          total_experience_years?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hr_remarks: {
        Row: {
          application_id: string
          author_id: string | null
          author_name: string | null
          body: string
          created_at: string
          id: string
          remark_type: string
        }
        Insert: {
          application_id: string
          author_id?: string | null
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          remark_type?: string
        }
        Update: {
          application_id?: string
          author_id?: string | null
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          remark_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_remarks_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          closing_date: string | null
          created_at: string
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          openings: number
          posting_date: string
          published: boolean
          requirements: string
          responsibilities: string
          status: string
          title: string
        }
        Insert: {
          closing_date?: string | null
          created_at?: string
          department: string
          description?: string
          employment_type?: string
          id?: string
          location?: string
          openings?: number
          posting_date?: string
          published?: boolean
          requirements?: string
          responsibilities?: string
          status?: string
          title: string
        }
        Update: {
          closing_date?: string | null
          created_at?: string
          department?: string
          description?: string
          employment_type?: string
          id?: string
          location?: string
          openings?: number
          posting_date?: string
          published?: boolean
          requirements?: string
          responsibilities?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_hr: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "candidate" | "hr_staff" | "hr_admin"
      application_status:
        | "New"
        | "Shortlisted"
        | "Interviewed"
        | "Hired"
        | "Rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["candidate", "hr_staff", "hr_admin"],
      application_status: [
        "New",
        "Shortlisted",
        "Interviewed",
        "Hired",
        "Rejected",
      ],
    },
  },
} as const
