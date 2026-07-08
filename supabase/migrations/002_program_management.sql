-- KKN, Tugas Akhir, Kerja Praktek management module

CREATE TYPE academic_program_type AS ENUM ('kkn', 'ta', 'kp');
CREATE TYPE academic_program_registration_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'active',
  'completed'
);
CREATE TYPE academic_program_assignment_role AS ENUM ('supervisor', 'examiner');
CREATE TYPE academic_program_logbook_status AS ENUM (
  'pending',
  'accepted',
  'revision',
  'rejected'
);

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'academic-program-documents',
  'academic-program-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

CREATE POLICY academic_program_documents_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'academic-program-documents');

CREATE POLICY academic_program_documents_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'academic-program-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE TABLE academic_program_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_type academic_program_type NOT NULL,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  semester_id UUID NOT NULL REFERENCES semesters(id),
  study_program_id UUID REFERENCES study_programs(id),
  transcript_course_id UUID REFERENCES courses(id),
  name TEXT NOT NULL,
  registration_start DATE NOT NULL,
  registration_end DATE NOT NULL,
  activity_start DATE,
  activity_end DATE,
  min_credits INT NOT NULL DEFAULT 0,
  min_gpa NUMERIC(4,2) NOT NULL DEFAULT 0,
  supervisor_quota_default INT NOT NULL DEFAULT 8,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academic_program_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES academic_program_periods(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  proposal_title TEXT NOT NULL,
  proposal_summary TEXT,
  document_krs_url TEXT,
  document_transcript_url TEXT,
  document_proposal_url TEXT,
  status academic_program_registration_status NOT NULL DEFAULT 'pending',
  prerequisite_credits INT NOT NULL DEFAULT 0,
  prerequisite_gpa NUMERIC(4,2) NOT NULL DEFAULT 0,
  prerequisite_passed BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  final_score NUMERIC(5,2),
  final_letter_grade TEXT,
  grade_point NUMERIC(3,2),
  finalized_by UUID REFERENCES profiles(id),
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(period_id, student_id)
);

CREATE TABLE academic_program_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES academic_program_registrations(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES lecturers(id),
  assignment_role academic_program_assignment_role NOT NULL,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(registration_id, lecturer_id, assignment_role)
);

CREATE TABLE academic_program_logbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES academic_program_registrations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  week_number INT NOT NULL DEFAULT 1,
  activity TEXT NOT NULL,
  progress_note TEXT,
  attachment_url TEXT,
  status academic_program_logbook_status NOT NULL DEFAULT 'pending',
  supervisor_note TEXT,
  reviewed_by UUID REFERENCES lecturers(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academic_program_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES academic_program_periods(id) ON DELETE CASCADE,
  component TEXT NOT NULL,
  assessor_role academic_program_assignment_role NOT NULL DEFAULT 'supervisor',
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  weight_percent NUMERIC(5,2) NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE academic_program_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES academic_program_registrations(id) ON DELETE CASCADE,
  rubric_id UUID NOT NULL REFERENCES academic_program_rubrics(id) ON DELETE CASCADE,
  assessor_id UUID NOT NULL REFERENCES lecturers(id),
  score NUMERIC(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(registration_id, rubric_id, assessor_id)
);

CREATE INDEX idx_program_periods_type ON academic_program_periods(program_type);
CREATE INDEX idx_program_periods_study_program ON academic_program_periods(study_program_id);
CREATE INDEX idx_program_registrations_period ON academic_program_registrations(period_id);
CREATE INDEX idx_program_registrations_student ON academic_program_registrations(student_id);
CREATE INDEX idx_program_registrations_status ON academic_program_registrations(status);
CREATE INDEX idx_program_assignments_registration ON academic_program_assignments(registration_id);
CREATE INDEX idx_program_assignments_lecturer ON academic_program_assignments(lecturer_id);
CREATE INDEX idx_program_logbooks_registration ON academic_program_logbooks(registration_id);
CREATE INDEX idx_program_rubrics_period ON academic_program_rubrics(period_id);
CREATE INDEX idx_program_assessments_registration ON academic_program_assessments(registration_id);

CREATE TRIGGER academic_program_periods_updated_at
  BEFORE UPDATE ON academic_program_periods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER academic_program_registrations_updated_at
  BEFORE UPDATE ON academic_program_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER academic_program_logbooks_updated_at
  BEFORE UPDATE ON academic_program_logbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER academic_program_rubrics_updated_at
  BEFORE UPDATE ON academic_program_rubrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER academic_program_assessments_updated_at
  BEFORE UPDATE ON academic_program_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE academic_program_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_program_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_program_logbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_program_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_program_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY program_periods_select ON academic_program_periods
  FOR SELECT USING (
    is_active = true
    OR get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
  );

CREATE POLICY program_periods_manage ON academic_program_periods
  FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi'))
  WITH CHECK (get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi'));

CREATE POLICY program_registrations_select ON academic_program_registrations
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    OR get_user_role() IN ('super_admin', 'admin_akademik')
    OR (
      get_user_role() = 'kaprodi'
      AND student_id IN (
        SELECT id FROM students WHERE study_program_id = get_user_study_program_id()
      )
    )
    OR id IN (
      SELECT registration_id FROM academic_program_assignments a
      JOIN lecturers l ON l.id = a.lecturer_id
      WHERE l.profile_id = auth.uid()
    )
  );

CREATE POLICY program_registrations_insert ON academic_program_registrations
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    OR get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
  );

CREATE POLICY program_registrations_update ON academic_program_registrations
  FOR UPDATE USING (
    get_user_role() IN ('super_admin', 'admin_akademik')
    OR (
      get_user_role() = 'kaprodi'
      AND student_id IN (
        SELECT id FROM students WHERE study_program_id = get_user_study_program_id()
      )
    )
    OR (
      student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
      AND status IN ('pending', 'rejected')
    )
  )
  WITH CHECK (
    get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
    OR student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY program_assignments_select ON academic_program_assignments
  FOR SELECT USING (
    get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
    OR lecturer_id IN (SELECT id FROM lecturers WHERE profile_id = auth.uid())
    OR registration_id IN (
      SELECT id FROM academic_program_registrations
      WHERE student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY program_assignments_manage ON academic_program_assignments
  FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi'))
  WITH CHECK (get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi'));

CREATE POLICY program_logbooks_select ON academic_program_logbooks
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    OR get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
    OR registration_id IN (
      SELECT registration_id FROM academic_program_assignments a
      JOIN lecturers l ON l.id = a.lecturer_id
      WHERE l.profile_id = auth.uid()
    )
  );

CREATE POLICY program_logbooks_insert ON academic_program_logbooks
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    OR get_user_role() IN ('super_admin', 'admin_akademik')
  );

CREATE POLICY program_logbooks_update ON academic_program_logbooks
  FOR UPDATE USING (
    get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
    OR (
      student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
      AND status = 'pending'
    )
    OR registration_id IN (
      SELECT registration_id FROM academic_program_assignments a
      JOIN lecturers l ON l.id = a.lecturer_id
      WHERE l.profile_id = auth.uid()
        AND a.assignment_role = 'supervisor'
    )
  );

CREATE POLICY program_rubrics_select ON academic_program_rubrics
  FOR SELECT USING (true);

CREATE POLICY program_rubrics_manage ON academic_program_rubrics
  FOR ALL USING (get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi'))
  WITH CHECK (get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi'));

CREATE POLICY program_assessments_select ON academic_program_assessments
  FOR SELECT USING (
    get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
    OR assessor_id IN (SELECT id FROM lecturers WHERE profile_id = auth.uid())
    OR registration_id IN (
      SELECT id FROM academic_program_registrations
      WHERE student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY program_assessments_manage ON academic_program_assessments
  FOR ALL USING (
    get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
    OR EXISTS (
      SELECT 1
      FROM academic_program_assignments a
      JOIN academic_program_rubrics r ON r.id = academic_program_assessments.rubric_id
      JOIN lecturers l ON l.id = a.lecturer_id
      WHERE a.registration_id = academic_program_assessments.registration_id
        AND a.lecturer_id = academic_program_assessments.assessor_id
        AND a.assignment_role = r.assessor_role
        AND l.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    get_user_role() IN ('super_admin', 'admin_akademik', 'kaprodi')
    OR EXISTS (
      SELECT 1
      FROM academic_program_assignments a
      JOIN academic_program_rubrics r ON r.id = academic_program_assessments.rubric_id
      JOIN lecturers l ON l.id = a.lecturer_id
      WHERE a.registration_id = academic_program_assessments.registration_id
        AND a.lecturer_id = academic_program_assessments.assessor_id
        AND a.assignment_role = r.assessor_role
        AND l.profile_id = auth.uid()
    )
  );
