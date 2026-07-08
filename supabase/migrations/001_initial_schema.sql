-- Sistem Akademik Universitas - Initial Schema
-- Run in Supabase SQL Editor or via supabase db push

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
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
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
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
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
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
  approved_by UUID REFERENCES profiles(id),
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
  profile_id UUID REFERENCES profiles(id),
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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'mahasiswa')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER faculties_updated_at BEFORE UPDATE ON faculties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER study_programs_updated_at BEFORE UPDATE ON study_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER lecturers_updated_at BEFORE UPDATE ON lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER course_registrations_updated_at BEFORE UPDATE ON course_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Helper: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's study program (for kaprodi)
CREATE OR REPLACE FUNCTION get_user_study_program_id()
RETURNS UUID AS $$
  SELECT study_program_id FROM lecturers WHERE profile_id = auth.uid()
  UNION
  SELECT study_program_id FROM students WHERE profile_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_registration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid()
  OR get_user_role() IN ('super_admin', 'admin_akademik')
  OR (get_user_role() = 'kaprodi' AND id IN (
    SELECT profile_id FROM students WHERE study_program_id = get_user_study_program_id()
    UNION SELECT profile_id FROM lecturers WHERE study_program_id = get_user_study_program_id()
  ))
);

CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  id = auth.uid() OR get_user_role() = 'super_admin'
);

CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (
  get_user_role() = 'super_admin'
);

-- Admin full access helper policies for master data
CREATE POLICY admin_all_faculties ON faculties FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik'));
CREATE POLICY read_faculties ON faculties FOR SELECT USING (get_user_role() IN ('kaprodi', 'dosen', 'mahasiswa'));

CREATE POLICY admin_all_study_programs ON study_programs FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik'));
CREATE POLICY read_study_programs ON study_programs FOR SELECT USING (true);

CREATE POLICY admin_all_academic_years ON academic_years FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik'));
CREATE POLICY read_academic_years ON academic_years FOR SELECT USING (true);

CREATE POLICY admin_all_semesters ON semesters FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik'));
CREATE POLICY read_semesters ON semesters FOR SELECT USING (true);

CREATE POLICY admin_all_curriculums ON curriculums FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik'));
CREATE POLICY read_curriculums ON curriculums FOR SELECT USING (true);

CREATE POLICY admin_all_rooms ON rooms FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik'));
CREATE POLICY read_rooms ON rooms FOR SELECT USING (true);

-- Students policies
CREATE POLICY students_select ON students FOR SELECT USING (
  profile_id = auth.uid()
  OR get_user_role() IN ('super_admin', 'admin_akademik')
  OR (get_user_role() = 'kaprodi' AND study_program_id = get_user_study_program_id())
  OR (get_user_role() = 'dosen' AND id IN (
    SELECT cr.student_id FROM course_registration_items cri
    JOIN course_registrations cr ON cr.id = cri.course_registration_id
    JOIN classes c ON c.id = cri.class_id
    JOIN lecturers l ON l.id = c.lecturer_id
    WHERE l.profile_id = auth.uid()
  ))
);

CREATE POLICY students_manage ON students FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

-- Lecturers policies
CREATE POLICY lecturers_select ON lecturers FOR SELECT USING (
  profile_id = auth.uid()
  OR get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi', 'mahasiswa')
);

CREATE POLICY lecturers_manage ON lecturers FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

-- Courses policies
CREATE POLICY courses_select ON courses FOR SELECT USING (true);
CREATE POLICY courses_manage ON courses FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

-- Classes policies
CREATE POLICY classes_select ON classes FOR SELECT USING (true);
CREATE POLICY classes_manage ON classes FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

-- Class schedules policies
CREATE POLICY class_schedules_select ON class_schedules FOR SELECT USING (true);
CREATE POLICY class_schedules_manage ON class_schedules FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

-- Student advisors
CREATE POLICY student_advisors_select ON student_advisors FOR SELECT USING (true);
CREATE POLICY student_advisors_manage ON student_advisors FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

-- Course registrations (KRS)
CREATE POLICY krs_select ON course_registrations FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  OR get_user_role() IN ('super_admin', 'admin_akademik')
  OR (get_user_role() = 'dosen' AND student_id IN (
    SELECT sa.student_id FROM student_advisors sa
    JOIN lecturers l ON l.id = sa.lecturer_id
    WHERE l.profile_id = auth.uid()
  ))
);

CREATE POLICY krs_insert ON course_registrations FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  OR get_user_role() IN ('super_admin', 'admin_akademik')
);

CREATE POLICY krs_update ON course_registrations FOR UPDATE USING (
  (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()) AND status IN ('draft', 'submitted'))
  OR get_user_role() IN ('super_admin', 'admin_akademik')
  OR (get_user_role() = 'dosen' AND student_id IN (
    SELECT sa.student_id FROM student_advisors sa
    JOIN lecturers l ON l.id = sa.lecturer_id
    WHERE l.profile_id = auth.uid()
  ))
);

-- Course registration items
CREATE POLICY krs_items_select ON course_registration_items FOR SELECT USING (true);
CREATE POLICY krs_items_manage ON course_registration_items FOR ALL USING (
  course_registration_id IN (
    SELECT id FROM course_registrations WHERE
      student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
      OR get_user_role() IN ('super_admin', 'admin_akademik')
  )
);

-- Grades policies
CREATE POLICY grades_select ON grades FOR SELECT USING (
  (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()) AND is_published = true)
  OR get_user_role() IN ('super_admin', 'admin_akademik')
  OR (get_user_role() = 'dosen' AND class_id IN (
    SELECT c.id FROM classes c
    JOIN lecturers l ON l.id = c.lecturer_id
    WHERE l.profile_id = auth.uid()
  ))
);

CREATE POLICY grades_manage ON grades FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
  OR (get_user_role() = 'dosen' AND class_id IN (
    SELECT c.id FROM classes c
    JOIN lecturers l ON l.id = c.lecturer_id
    WHERE l.profile_id = auth.uid()
  ) AND is_locked = false)
);

-- Academic records
CREATE POLICY academic_records_select ON academic_records FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  OR get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
);

CREATE POLICY academic_records_manage ON academic_records FOR ALL USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

-- Activity logs
CREATE POLICY activity_logs_select ON activity_logs FOR SELECT USING (
  get_user_role() IN ('super_admin', 'admin_akademik')
);

CREATE POLICY activity_logs_insert ON activity_logs FOR INSERT WITH CHECK (true);
