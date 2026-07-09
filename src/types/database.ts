export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "super_admin"
  | "admin_akademik"
  | "kaprodi"
  | "dosen"
  | "mahasiswa";

export type KrsStatus = "draft" | "submitted" | "approved" | "rejected";
export type ClassStatus = "open" | "closed" | "cancelled";
export type AcademicStatus =
  | "active"
  | "leave"
  | "graduated"
  | "dropout"
  | "inactive";
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";
export type AcademicProgramType = "kkn" | "ta" | "kp";
export type AcademicProgramRegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "completed";
export type AcademicProgramAssignmentRole = "supervisor" | "examiner";
export type AcademicProgramLogbookStatus =
  | "pending"
  | "accepted"
  | "revision"
  | "rejected";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          password_hash: string;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          password_hash: string;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      faculties: {
        Row: {
          id: string;
          code: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faculties"]["Insert"]>;
        Relationships: [];
      };
      study_programs: {
        Row: {
          id: string;
          faculty_id: string;
          code: string;
          name: string;
          degree_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          faculty_id: string;
          code: string;
          name: string;
          degree_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["study_programs"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "study_programs_faculty_id_fkey";
            columns: ["faculty_id"];
            isOneToOne: false;
            referencedRelation: "faculties";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_years: {
        Row: {
          id: string;
          year_label: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          year_label: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_years"]["Insert"]
        >;
        Relationships: [];
      };
      semesters: {
        Row: {
          id: string;
          academic_year_id: string;
          name: string;
          semester_number: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academic_year_id: string;
          name: string;
          semester_number: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["semesters"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "semesters_academic_year_id_fkey";
            columns: ["academic_year_id"];
            isOneToOne: false;
            referencedRelation: "academic_years";
            referencedColumns: ["id"];
          },
        ];
      };
      curriculums: {
        Row: {
          id: string;
          study_program_id: string;
          name: string;
          year: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          study_program_id: string;
          name: string;
          year: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["curriculums"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "curriculums_study_program_id_fkey";
            columns: ["study_program_id"];
            isOneToOne: false;
            referencedRelation: "study_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          id: string;
          profile_id: string;
          student_number: string;
          study_program_id: string;
          entry_year: number;
          academic_status: AcademicStatus;
          current_semester: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          student_number: string;
          study_program_id: string;
          entry_year: number;
          academic_status?: AcademicStatus;
          current_semester?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "students_study_program_id_fkey";
            columns: ["study_program_id"];
            isOneToOne: false;
            referencedRelation: "study_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      lecturers: {
        Row: {
          id: string;
          profile_id: string;
          lecturer_number: string;
          study_program_id: string | null;
          expertise: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          lecturer_number: string;
          study_program_id?: string | null;
          expertise?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lecturers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "lecturers_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lecturers_study_program_id_fkey";
            columns: ["study_program_id"];
            isOneToOne: false;
            referencedRelation: "study_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          id: string;
          course_code: string;
          course_name: string;
          credits: number;
          semester_recommended: number;
          study_program_id: string;
          curriculum_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_code: string;
          course_name: string;
          credits: number;
          semester_recommended?: number;
          study_program_id: string;
          curriculum_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "courses_curriculum_id_fkey";
            columns: ["curriculum_id"];
            isOneToOne: false;
            referencedRelation: "curriculums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "courses_study_program_id_fkey";
            columns: ["study_program_id"];
            isOneToOne: false;
            referencedRelation: "study_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          name: string;
          capacity: number;
          building: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          capacity?: number;
          building?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Insert"]>;
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          course_id: string;
          lecturer_id: string;
          academic_year_id: string;
          semester_id: string;
          class_name: string;
          capacity: number;
          status: ClassStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          lecturer_id: string;
          academic_year_id: string;
          semester_id: string;
          class_name: string;
          capacity?: number;
          status?: ClassStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey";
            columns: ["academic_year_id"];
            isOneToOne: false;
            referencedRelation: "academic_years";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_lecturer_id_fkey";
            columns: ["lecturer_id"];
            isOneToOne: false;
            referencedRelation: "lecturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classes_semester_id_fkey";
            columns: ["semester_id"];
            isOneToOne: false;
            referencedRelation: "semesters";
            referencedColumns: ["id"];
          },
        ];
      };
      class_schedules: {
        Row: {
          id: string;
          class_id: string;
          room_id: string;
          day_of_week: DayOfWeek;
          start_time: string;
          end_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          room_id: string;
          day_of_week: DayOfWeek;
          start_time: string;
          end_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["class_schedules"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_schedules_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      student_advisors: {
        Row: {
          id: string;
          student_id: string;
          lecturer_id: string;
          academic_year_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          lecturer_id: string;
          academic_year_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["student_advisors"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "student_advisors_academic_year_id_fkey";
            columns: ["academic_year_id"];
            isOneToOne: false;
            referencedRelation: "academic_years";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_advisors_lecturer_id_fkey";
            columns: ["lecturer_id"];
            isOneToOne: false;
            referencedRelation: "lecturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_advisors_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      course_registrations: {
        Row: {
          id: string;
          student_id: string;
          academic_year_id: string;
          semester_id: string;
          status: KrsStatus;
          submitted_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          academic_year_id: string;
          semester_id: string;
          status?: KrsStatus;
          submitted_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["course_registrations"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "course_registrations_academic_year_id_fkey";
            columns: ["academic_year_id"];
            isOneToOne: false;
            referencedRelation: "academic_years";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_registrations_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_registrations_semester_id_fkey";
            columns: ["semester_id"];
            isOneToOne: false;
            referencedRelation: "semesters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_registrations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      course_registration_items: {
        Row: {
          id: string;
          course_registration_id: string;
          class_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_registration_id: string;
          class_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["course_registration_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "course_registration_items_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "course_registration_items_course_registration_id_fkey";
            columns: ["course_registration_id"];
            isOneToOne: false;
            referencedRelation: "course_registrations";
            referencedColumns: ["id"];
          },
        ];
      };
      grades: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          assignment_score: number | null;
          midterm_score: number | null;
          final_score: number | null;
          final_numeric_score: number | null;
          final_letter_grade: string | null;
          grade_point: number | null;
          is_published: boolean;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          assignment_score?: number | null;
          midterm_score?: number | null;
          final_score?: number | null;
          final_numeric_score?: number | null;
          final_letter_grade?: string | null;
          grade_point?: number | null;
          is_published?: boolean;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["grades"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "grades_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grades_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_records: {
        Row: {
          id: string;
          student_id: string;
          academic_year_id: string;
          semester_id: string;
          ips: number | null;
          total_sks: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          academic_year_id: string;
          semester_id: string;
          ips?: number | null;
          total_sks?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_records"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "academic_records_academic_year_id_fkey";
            columns: ["academic_year_id"];
            isOneToOne: false;
            referencedRelation: "academic_years";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_records_semester_id_fkey";
            columns: ["semester_id"];
            isOneToOne: false;
            referencedRelation: "semesters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_records_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          profile_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["activity_logs"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "activity_logs_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_program_periods: {
        Row: {
          id: string;
          program_type: AcademicProgramType;
          academic_year_id: string;
          semester_id: string;
          study_program_id: string | null;
          transcript_course_id: string | null;
          name: string;
          registration_start: string;
          registration_end: string;
          activity_start: string | null;
          activity_end: string | null;
          min_credits: number;
          min_gpa: number;
          supervisor_quota_default: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_type: AcademicProgramType;
          academic_year_id: string;
          semester_id: string;
          study_program_id?: string | null;
          transcript_course_id?: string | null;
          name: string;
          registration_start: string;
          registration_end: string;
          activity_start?: string | null;
          activity_end?: string | null;
          min_credits?: number;
          min_gpa?: number;
          supervisor_quota_default?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_program_periods"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "academic_program_periods_academic_year_id_fkey";
            columns: ["academic_year_id"];
            isOneToOne: false;
            referencedRelation: "academic_years";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_periods_semester_id_fkey";
            columns: ["semester_id"];
            isOneToOne: false;
            referencedRelation: "semesters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_periods_study_program_id_fkey";
            columns: ["study_program_id"];
            isOneToOne: false;
            referencedRelation: "study_programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_periods_transcript_course_id_fkey";
            columns: ["transcript_course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_program_registrations: {
        Row: {
          id: string;
          period_id: string;
          student_id: string;
          proposal_title: string;
          proposal_summary: string | null;
          document_krs_url: string | null;
          document_transcript_url: string | null;
          document_proposal_url: string | null;
          status: AcademicProgramRegistrationStatus;
          prerequisite_credits: number;
          prerequisite_gpa: number;
          prerequisite_passed: boolean;
          rejection_reason: string | null;
          submitted_at: string;
          approved_by: string | null;
          approved_at: string | null;
          final_score: number | null;
          final_letter_grade: string | null;
          grade_point: number | null;
          finalized_by: string | null;
          finalized_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period_id: string;
          student_id: string;
          proposal_title: string;
          proposal_summary?: string | null;
          document_krs_url?: string | null;
          document_transcript_url?: string | null;
          document_proposal_url?: string | null;
          status?: AcademicProgramRegistrationStatus;
          prerequisite_credits?: number;
          prerequisite_gpa?: number;
          prerequisite_passed?: boolean;
          rejection_reason?: string | null;
          submitted_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          final_score?: number | null;
          final_letter_grade?: string | null;
          grade_point?: number | null;
          finalized_by?: string | null;
          finalized_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_program_registrations"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "academic_program_registrations_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_registrations_finalized_by_fkey";
            columns: ["finalized_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_registrations_period_id_fkey";
            columns: ["period_id"];
            isOneToOne: false;
            referencedRelation: "academic_program_periods";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_registrations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_program_assignments: {
        Row: {
          id: string;
          registration_id: string;
          lecturer_id: string;
          assignment_role: AcademicProgramAssignmentRole;
          assigned_by: string | null;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          lecturer_id: string;
          assignment_role: AcademicProgramAssignmentRole;
          assigned_by?: string | null;
          assigned_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_program_assignments"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "academic_program_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_assignments_lecturer_id_fkey";
            columns: ["lecturer_id"];
            isOneToOne: false;
            referencedRelation: "lecturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_assignments_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: false;
            referencedRelation: "academic_program_registrations";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_program_logbooks: {
        Row: {
          id: string;
          registration_id: string;
          student_id: string;
          entry_date: string;
          week_number: number;
          activity: string;
          progress_note: string | null;
          attachment_url: string | null;
          status: AcademicProgramLogbookStatus;
          supervisor_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          student_id: string;
          entry_date: string;
          week_number?: number;
          activity: string;
          progress_note?: string | null;
          attachment_url?: string | null;
          status?: AcademicProgramLogbookStatus;
          supervisor_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_program_logbooks"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "academic_program_logbooks_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: false;
            referencedRelation: "academic_program_registrations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_logbooks_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "lecturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_logbooks_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_program_rubrics: {
        Row: {
          id: string;
          period_id: string;
          component: string;
          assessor_role: AcademicProgramAssignmentRole;
          max_score: number;
          weight_percent: number;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period_id: string;
          component: string;
          assessor_role?: AcademicProgramAssignmentRole;
          max_score?: number;
          weight_percent: number;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_program_rubrics"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "academic_program_rubrics_period_id_fkey";
            columns: ["period_id"];
            isOneToOne: false;
            referencedRelation: "academic_program_periods";
            referencedColumns: ["id"];
          },
        ];
      };
      academic_program_assessments: {
        Row: {
          id: string;
          registration_id: string;
          rubric_id: string;
          assessor_id: string;
          score: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          rubric_id: string;
          assessor_id: string;
          score: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["academic_program_assessments"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "academic_program_assessments_assessor_id_fkey";
            columns: ["assessor_id"];
            isOneToOne: false;
            referencedRelation: "lecturers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_assessments_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: false;
            referencedRelation: "academic_program_registrations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academic_program_assessments_rubric_id_fkey";
            columns: ["rubric_id"];
            isOneToOne: false;
            referencedRelation: "academic_program_rubrics";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      authenticate_user: {
        Args: {
          login_email: string;
          login_password: string;
        };
        Returns: Array<{
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }>;
      };
      create_user: {
        Args: {
          p_full_name: string;
          p_email: string;
          p_password: string;
          p_role: UserRole;
        };
        Returns: Array<{
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          is_active: boolean;
          created_at: string;
        }>;
      };
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      get_user_study_program_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
  };
}

export type Profile = Omit<
  Database["public"]["Tables"]["users"]["Row"],
  "password_hash"
>;
export type Faculty = Database["public"]["Tables"]["faculties"]["Row"];
export type StudyProgram =
  Database["public"]["Tables"]["study_programs"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Lecturer = Database["public"]["Tables"]["lecturers"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Class = Database["public"]["Tables"]["classes"]["Row"];
export type ClassSchedule =
  Database["public"]["Tables"]["class_schedules"]["Row"];
export type CourseRegistration =
  Database["public"]["Tables"]["course_registrations"]["Row"];
export type Grade = Database["public"]["Tables"]["grades"]["Row"];
export type AcademicProgramPeriod =
  Database["public"]["Tables"]["academic_program_periods"]["Row"];
export type AcademicProgramRegistration =
  Database["public"]["Tables"]["academic_program_registrations"]["Row"];
export type AcademicProgramAssignment =
  Database["public"]["Tables"]["academic_program_assignments"]["Row"];
export type AcademicProgramLogbook =
  Database["public"]["Tables"]["academic_program_logbooks"]["Row"];
export type AcademicProgramRubric =
  Database["public"]["Tables"]["academic_program_rubrics"]["Row"];
export type AcademicProgramAssessment =
  Database["public"]["Tables"]["academic_program_assessments"]["Row"];
