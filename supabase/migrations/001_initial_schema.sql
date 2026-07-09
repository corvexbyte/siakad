-- Sistem Akademik Universitas - Initial Schema
-- Run in Supabase SQL Editor or via supabase db push

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Enums
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin_akademik',
  'kaprodi',
  'dosen',
  'mahasiswa'
);

CREATE TYPE krs_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE class_status AS ENUM ('open', 'closed', 'cancelled');
CREATE TYPE academic_status AS ENUM ('active', 'leave', 'graduated', 'dropout', 'inactive');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- Application users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'mahasiswa',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Faculties
CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Study Programs
CREATE TABLE study_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  degree_level TEXT NOT NULL DEFAULT 'S1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Academic Years
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Semesters
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  semester_number INT NOT NULL CHECK (semester_number IN (1, 2, 3)),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(academic_year_id, semester_number)
);

-- Curriculums
CREATE TABLE curriculums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_program_id UUID NOT NULL REFERENCES study_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  student_number TEXT NOT NULL UNIQUE,
  study_program_id UUID NOT NULL REFERENCES study_programs(id),
  entry_year INT NOT NULL,
  academic_status academic_status NOT NULL DEFAULT 'active',
  current_semester INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lecturers
CREATE TABLE lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  lecturer_number TEXT NOT NULL UNIQUE,
  study_program_id UUID REFERENCES study_programs(id),
  expertise TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  credits INT NOT NULL CHECK (credits > 0),
  semester_recommended INT NOT NULL DEFAULT 1,
  study_program_id UUID NOT NULL REFERENCES study_programs(id),
  curriculum_id UUID REFERENCES curriculums(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 40,
  building TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES lecturers(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  semester_id UUID NOT NULL REFERENCES semesters(id),
  class_name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 40,
  status class_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Class Schedules
CREATE TABLE class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id),
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Advisors
CREATE TABLE student_advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES lecturers(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year_id)
);

-- Course Registrations (KRS)
CREATE TABLE course_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  semester_id UUID NOT NULL REFERENCES semesters(id),
  status krs_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year_id, semester_id)
);

-- Course Registration Items
CREATE TABLE course_registration_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_registration_id UUID NOT NULL REFERENCES course_registrations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_registration_id, class_id)
);

-- Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  assignment_score NUMERIC(5,2),
  midterm_score NUMERIC(5,2),
  final_score NUMERIC(5,2),
  final_numeric_score NUMERIC(5,2),
  final_letter_grade TEXT,
  grade_point NUMERIC(3,2),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Academic Records
CREATE TABLE academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  semester_id UUID NOT NULL REFERENCES semesters(id),
  ips NUMERIC(4,2),
  total_sks INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year_id, semester_id)
);

-- Activity Logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_students_study_program ON students(study_program_id);
CREATE INDEX idx_students_profile ON students(profile_id);
CREATE INDEX idx_lecturers_profile ON lecturers(profile_id);
CREATE INDEX idx_lecturers_study_program ON lecturers(study_program_id);
CREATE INDEX idx_courses_study_program ON courses(study_program_id);
CREATE INDEX idx_classes_course ON classes(course_id);
CREATE INDEX idx_classes_lecturer ON classes(lecturer_id);
CREATE INDEX idx_class_schedules_class ON class_schedules(class_id);
CREATE INDEX idx_course_registrations_student ON course_registrations(student_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_class ON grades(class_id);
CREATE INDEX idx_activity_logs_profile ON activity_logs(profile_id);

CREATE OR REPLACE FUNCTION public.authenticate_user(
  login_email TEXT,
  login_password TEXT
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  role user_role,
  avatar_url TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
-- Include extensions in search_path so crypt() resolves correctly
SET search_path = public, extensions
AS $$
  SELECT
    users.id,
    users.full_name,
    users.email,
    users.role,
    users.avatar_url,
    users.is_active,
    users.created_at,
    users.updated_at
  FROM users
  WHERE lower(users.email) = lower(trim(login_email))
    AND users.password_hash = crypt(login_password, users.password_hash)
  LIMIT 1;
$$;

-- Grant execute to anon role so the publishable-key Supabase client can call this RPC
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon, authenticated;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER faculties_updated_at BEFORE UPDATE ON faculties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER study_programs_updated_at BEFORE UPDATE ON study_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lecturers_updated_at BEFORE UPDATE ON lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER course_registrations_updated_at BEFORE UPDATE ON course_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- NOTE: This project uses MANUAL (custom) auth — NOT Supabase Auth.
-- Sessions are stored in signed cookies; auth.uid() is always NULL.
-- Authorization is enforced at the Next.js server-action layer.
-- RLS is DISABLED on all tables so the server client can read/write freely.
-- The get_user_role / get_user_study_program_id helpers below are kept as
-- no-op stubs so any code referencing them compiles without error.

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT 'super_admin'::user_role; -- stub: real auth handled in app layer
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_study_program_id()
RETURNS UUID AS $$
  SELECT NULL::UUID;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS: DISABLED — custom session auth is enforced at app layer
-- The Next.js server uses the Supabase key directly; RLS is not
-- needed and auth.uid() is always NULL (no Supabase Auth used).
-- ============================================================
ALTER TABLE users                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculties                DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_programs           DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years           DISABLE ROW LEVEL SECURITY;
ALTER TABLE semesters                DISABLE ROW LEVEL SECURITY;
ALTER TABLE curriculums              DISABLE ROW LEVEL SECURITY;
ALTER TABLE students                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers                DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms                    DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules          DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_advisors         DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations     DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_registration_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records         DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs            DISABLE ROW LEVEL SECURITY;
