-- Seed data for demo/testing
-- Run AFTER migrations. Demo users use password `password123`.
-- NOTE: Auth is manual (custom cookie session + users table). NOT using Supabase Auth.

-- ============================================================
-- USER ACCOUNTS (valid UUIDs, password hashed with bcrypt)
-- ============================================================
INSERT INTO users (
  id,
  full_name,
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'Super Admin',
    'admin@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'super_admin'::user_role,
    true,
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab'::uuid,
    'Admin Akademik',
    'akademik@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'admin_akademik'::user_role,
    true,
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac'::uuid,
    'Kaprodi TI',
    'kaprodi@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'kaprodi'::user_role,
    true,
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad'::uuid,
    'Dr. Budi Santoso',
    'dosen@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'dosen'::user_role,
    true,
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae'::uuid,
    'Ahmad Fauzi',
    'mahasiswa@siakad.demo',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    'mahasiswa'::user_role,
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  full_name    = EXCLUDED.full_name,
  email        = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role         = EXCLUDED.role,
  is_active    = true,
  updated_at   = now();

-- ============================================================
-- MASTER DATA
-- ============================================================

INSERT INTO faculties (id, code, name) VALUES
  (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'FTI',
    'Fakultas Teknologi Informasi'
  )
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name;

INSERT INTO study_programs (id, faculty_id, code, name, degree_level) VALUES
  (
    '22222222-2222-2222-2222-222222222222'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'TI',
    'Teknik Informatika',
    'S1'
  )
ON CONFLICT (id) DO UPDATE SET
  faculty_id   = EXCLUDED.faculty_id,
  code         = EXCLUDED.code,
  name         = EXCLUDED.name,
  degree_level = EXCLUDED.degree_level;

INSERT INTO academic_years (id, year_label, is_active) VALUES
  (
    '33333333-3333-3333-3333-333333333333'::uuid,
    '2025/2026',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  year_label = EXCLUDED.year_label,
  is_active  = EXCLUDED.is_active;

INSERT INTO semesters (id, academic_year_id, name, semester_number, is_active)
VALUES
  (
    '44444444-4444-4444-4444-444444444444'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    'Ganjil 2025/2026',
    1,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  academic_year_id = EXCLUDED.academic_year_id,
  name             = EXCLUDED.name,
  semester_number  = EXCLUDED.semester_number,
  is_active        = EXCLUDED.is_active;

INSERT INTO curriculums (id, study_program_id, name, year, is_active) VALUES
  (
    '55555555-5555-5555-5555-555555555555'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Kurikulum 2024',
    2024,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  study_program_id = EXCLUDED.study_program_id,
  name             = EXCLUDED.name,
  year             = EXCLUDED.year,
  is_active        = EXCLUDED.is_active;

INSERT INTO rooms (id, code, name, capacity, building) VALUES
  (
    '66666666-6666-6666-6666-666666666661'::uuid,
    'A101',
    'Ruang A101',
    40,
    'Gedung A'
  ),
  (
    '66666666-6666-6666-6666-666666666662'::uuid,
    'B201',
    'Lab Komputer B201',
    30,
    'Gedung B'
  )
ON CONFLICT (id) DO UPDATE SET
  code     = EXCLUDED.code,
  name     = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  building = EXCLUDED.building;

-- ============================================================
-- COURSES
-- ============================================================

INSERT INTO courses (
  id,
  course_code,
  course_name,
  credits,
  semester_recommended,
  study_program_id,
  curriculum_id
) VALUES
  (
    '77777777-7777-7777-7777-777777777771'::uuid,
    'TI101',
    'Algoritma dan Pemrograman',
    3,
    1,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid
  ),
  (
    '77777777-7777-7777-7777-777777777772'::uuid,
    'TI102',
    'Struktur Data',
    3,
    2,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid
  ),
  (
    '77777777-7777-7777-7777-777777777773'::uuid,
    'TI201',
    'Basis Data',
    3,
    3,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid
  ),
  (
    '77777777-7777-7777-7777-777777777774'::uuid,
    'TI202',
    'Pemrograman Web',
    3,
    4,
    '22222222-2222-2222-2222-222222222222'::uuid,
    '55555555-5555-5555-5555-555555555555'::uuid
  )
ON CONFLICT (id) DO UPDATE SET
  course_code          = EXCLUDED.course_code,
  course_name          = EXCLUDED.course_name,
  credits              = EXCLUDED.credits,
  semester_recommended = EXCLUDED.semester_recommended,
  study_program_id     = EXCLUDED.study_program_id,
  curriculum_id        = EXCLUDED.curriculum_id;

-- ============================================================
-- LECTURERS (reference user rows by explicit UUID)
-- ============================================================

INSERT INTO lecturers (
  id,
  profile_id,
  lecturer_number,
  study_program_id,
  expertise
) VALUES
  (
    '88888888-8888-8888-8888-888888888881'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac'::uuid,   -- kaprodi@siakad.demo
    '01010001',
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Manajemen Program Studi'
  ),
  (
    '88888888-8888-8888-8888-888888888882'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad'::uuid,   -- dosen@siakad.demo
    '01010002',
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Rekayasa Perangkat Lunak'
  )
ON CONFLICT (id) DO UPDATE SET
  profile_id       = EXCLUDED.profile_id,
  lecturer_number  = EXCLUDED.lecturer_number,
  study_program_id = EXCLUDED.study_program_id,
  expertise        = EXCLUDED.expertise;

-- ============================================================
-- STUDENTS (reference user rows by explicit UUID)
-- ============================================================

INSERT INTO students (
  id,
  profile_id,
  student_number,
  study_program_id,
  entry_year,
  academic_status,
  current_semester
) VALUES
  (
    '99999999-9999-9999-9999-999999999991'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae'::uuid,   -- mahasiswa@siakad.demo
    '24010001',
    '22222222-2222-2222-2222-222222222222'::uuid,
    2024,
    'active',
    1
  )
ON CONFLICT (id) DO UPDATE SET
  profile_id       = EXCLUDED.profile_id,
  student_number   = EXCLUDED.student_number,
  study_program_id = EXCLUDED.study_program_id,
  entry_year       = EXCLUDED.entry_year,
  academic_status  = EXCLUDED.academic_status,
  current_semester = EXCLUDED.current_semester;

-- ============================================================
-- CLASSES
-- ============================================================

INSERT INTO classes (
  id,
  course_id,
  lecturer_id,
  academic_year_id,
  semester_id,
  class_name,
  capacity,
  status
) VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid,
    '77777777-7777-7777-7777-777777777771'::uuid,
    '88888888-8888-8888-8888-888888888882'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'A',
    40,
    'open'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid,
    '77777777-7777-7777-7777-777777777772'::uuid,
    '88888888-8888-8888-8888-888888888882'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid,
    '44444444-4444-4444-4444-444444444444'::uuid,
    'A',
    40,
    'open'
  )
ON CONFLICT (id) DO UPDATE SET
  course_id        = EXCLUDED.course_id,
  lecturer_id      = EXCLUDED.lecturer_id,
  academic_year_id = EXCLUDED.academic_year_id,
  semester_id      = EXCLUDED.semester_id,
  class_name       = EXCLUDED.class_name,
  capacity         = EXCLUDED.capacity,
  status           = EXCLUDED.status;

-- ============================================================
-- CLASS SCHEDULES
-- ============================================================

INSERT INTO class_schedules (
  id,
  class_id,
  room_id,
  day_of_week,
  start_time,
  end_time
) VALUES
  (
    'cccccccc-cccc-cccc-cccc-cccccccccc01'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid,
    '66666666-6666-6666-6666-666666666661'::uuid,
    'monday',
    '08:00',
    '09:40'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccc02'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid,
    '66666666-6666-6666-6666-666666666662'::uuid,
    'tuesday',
    '10:00',
    '11:40'
  )
ON CONFLICT (id) DO UPDATE SET
  class_id    = EXCLUDED.class_id,
  room_id     = EXCLUDED.room_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time  = EXCLUDED.start_time,
  end_time    = EXCLUDED.end_time;

-- ============================================================
-- STUDENT ADVISORS
-- ============================================================

INSERT INTO student_advisors (id, student_id, lecturer_id, academic_year_id)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddd01'::uuid,
    '99999999-9999-9999-9999-999999999991'::uuid,
    '88888888-8888-8888-8888-888888888882'::uuid,
    '33333333-3333-3333-3333-333333333333'::uuid
  )
ON CONFLICT (student_id, academic_year_id) DO UPDATE SET
  lecturer_id = EXCLUDED.lecturer_id;
