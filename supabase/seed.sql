-- Seed data for demo/testing
-- Run AFTER migrations. Demo Auth users are confirmed here, so login does
-- not require email verification.

WITH demo_users (id, email, full_name, role) AS (
  VALUES
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid,
      'admin@siakad.demo',
      'Super Admin',
      'super_admin'
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
      'akademik@siakad.demo',
      'Admin Akademik',
      'admin_akademik'
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid,
      'kaprodi@siakad.demo',
      'Kaprodi TI',
      'kaprodi'
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'::uuid,
      'dosen@siakad.demo',
      'Dr. Budi Santoso',
      'dosen'
    ),
    (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'::uuid,
      'mahasiswa@siakad.demo',
      'Ahmad Fauzi',
      'mahasiswa'
    )
)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  demo_users.id,
  'authenticated',
  'authenticated',
  demo_users.email,
  crypt('password123', gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
  jsonb_build_object('full_name', demo_users.full_name, 'role', demo_users.role),
  now(),
  now()
FROM demo_users
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users
  WHERE auth.users.email = demo_users.email
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = COALESCE(auth.users.email_confirmed_at, EXCLUDED.email_confirmed_at),
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

WITH demo_users (email, full_name, role) AS (
  VALUES
    ('admin@siakad.demo', 'Super Admin', 'super_admin'),
    ('akademik@siakad.demo', 'Admin Akademik', 'admin_akademik'),
    ('kaprodi@siakad.demo', 'Kaprodi TI', 'kaprodi'),
    ('dosen@siakad.demo', 'Dr. Budi Santoso', 'dosen'),
    ('mahasiswa@siakad.demo', 'Ahmad Fauzi', 'mahasiswa')
)
UPDATE auth.users
SET
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
  raw_app_meta_data = jsonb_build_object(
    'provider',
    'email',
    'providers',
    ARRAY['email']
  ),
  raw_user_meta_data = jsonb_build_object(
    'full_name',
    demo_users.full_name,
    'role',
    demo_users.role
  ),
  updated_at = now()
FROM demo_users
WHERE auth.users.email = demo_users.email;

DELETE FROM auth.identities
USING auth.users
WHERE auth.identities.user_id = auth.users.id
  AND auth.identities.provider = 'email'
  AND auth.users.email IN (
    'admin@siakad.demo',
    'akademik@siakad.demo',
    'kaprodi@siakad.demo',
    'dosen@siakad.demo',
    'mahasiswa@siakad.demo'
  );

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  auth.users.id,
  auth.users.id,
  auth.users.id::text,
  jsonb_build_object(
    'sub',
    auth.users.id::text,
    'email',
    auth.users.email,
    'email_verified',
    true,
    'phone_verified',
    false
  ),
  'email',
  now(),
  now(),
  now()
FROM auth.users
WHERE auth.users.email IN (
  'admin@siakad.demo',
  'akademik@siakad.demo',
  'kaprodi@siakad.demo',
  'dosen@siakad.demo',
  'mahasiswa@siakad.demo'
)
ON CONFLICT (provider_id, provider) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  identity_data = EXCLUDED.identity_data,
  updated_at = now();

WITH demo_users (email, full_name, role) AS (
  VALUES
    ('admin@siakad.demo', 'Super Admin', 'super_admin'),
    ('akademik@siakad.demo', 'Admin Akademik', 'admin_akademik'),
    ('kaprodi@siakad.demo', 'Kaprodi TI', 'kaprodi'),
    ('dosen@siakad.demo', 'Dr. Budi Santoso', 'dosen'),
    ('mahasiswa@siakad.demo', 'Ahmad Fauzi', 'mahasiswa')
)
INSERT INTO profiles (id, full_name, email, role)
SELECT
  auth.users.id,
  demo_users.full_name,
  demo_users.email,
  demo_users.role::user_role
FROM auth.users
JOIN demo_users ON demo_users.email = auth.users.email
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = true;

-- Master data
INSERT INTO faculties (id, code, name) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'FTI',
    'Fakultas Teknologi Informasi'
  )
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name;

INSERT INTO study_programs (id, faculty_id, code, name, degree_level) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'TI',
    'Teknik Informatika',
    'S1'
  )
ON CONFLICT (id) DO UPDATE SET
  faculty_id = EXCLUDED.faculty_id,
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  degree_level = EXCLUDED.degree_level;

INSERT INTO academic_years (id, year_label, is_active) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    '2025/2026',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  year_label = EXCLUDED.year_label,
  is_active = EXCLUDED.is_active;

INSERT INTO semesters (id, academic_year_id, name, semester_number, is_active)
VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'Ganjil 2025/2026',
    1,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  academic_year_id = EXCLUDED.academic_year_id,
  name = EXCLUDED.name,
  semester_number = EXCLUDED.semester_number,
  is_active = EXCLUDED.is_active;

INSERT INTO curriculums (id, study_program_id, name, year, is_active) VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'Kurikulum 2024',
    2024,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  study_program_id = EXCLUDED.study_program_id,
  name = EXCLUDED.name,
  year = EXCLUDED.year,
  is_active = EXCLUDED.is_active;

INSERT INTO rooms (id, code, name, capacity, building) VALUES
  (
    '66666666-6666-6666-6666-666666666661',
    'A101',
    'Ruang A101',
    40,
    'Gedung A'
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    'B201',
    'Lab Komputer B201',
    30,
    'Gedung B'
  )
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  building = EXCLUDED.building;

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
    '77777777-7777-7777-7777-777777777771',
    'TI101',
    'Algoritma dan Pemrograman',
    3,
    1,
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    'TI102',
    'Struktur Data',
    3,
    2,
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555'
  ),
  (
    '77777777-7777-7777-7777-777777777773',
    'TI201',
    'Basis Data',
    3,
    3,
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555'
  ),
  (
    '77777777-7777-7777-7777-777777777774',
    'TI202',
    'Pemrograman Web',
    3,
    4,
    '22222222-2222-2222-2222-222222222222',
    '55555555-5555-5555-5555-555555555555'
  )
ON CONFLICT (id) DO UPDATE SET
  course_code = EXCLUDED.course_code,
  course_name = EXCLUDED.course_name,
  credits = EXCLUDED.credits,
  semester_recommended = EXCLUDED.semester_recommended,
  study_program_id = EXCLUDED.study_program_id,
  curriculum_id = EXCLUDED.curriculum_id;

INSERT INTO lecturers (
  id,
  profile_id,
  lecturer_number,
  study_program_id,
  expertise
) VALUES
  (
    '88888888-8888-8888-8888-888888888881',
    (SELECT id FROM profiles WHERE email = 'kaprodi@siakad.demo'),
    '01010001',
    '22222222-2222-2222-2222-222222222222',
    'Manajemen Program Studi'
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    (SELECT id FROM profiles WHERE email = 'dosen@siakad.demo'),
    '01010002',
    '22222222-2222-2222-2222-222222222222',
    'Rekayasa Perangkat Lunak'
  )
ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  lecturer_number = EXCLUDED.lecturer_number,
  study_program_id = EXCLUDED.study_program_id,
  expertise = EXCLUDED.expertise;

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
    '99999999-9999-9999-9999-999999999991',
    (SELECT id FROM profiles WHERE email = 'mahasiswa@siakad.demo'),
    '24010001',
    '22222222-2222-2222-2222-222222222222',
    2024,
    'active',
    1
  )
ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  student_number = EXCLUDED.student_number,
  study_program_id = EXCLUDED.study_program_id,
  entry_year = EXCLUDED.entry_year,
  academic_status = EXCLUDED.academic_status,
  current_semester = EXCLUDED.current_semester;

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
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '77777777-7777-7777-7777-777777777771',
    '88888888-8888-8888-8888-888888888882',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'A',
    40,
    'open'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '77777777-7777-7777-7777-777777777772',
    '88888888-8888-8888-8888-888888888882',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'A',
    40,
    'open'
  )
ON CONFLICT (id) DO UPDATE SET
  course_id = EXCLUDED.course_id,
  lecturer_id = EXCLUDED.lecturer_id,
  academic_year_id = EXCLUDED.academic_year_id,
  semester_id = EXCLUDED.semester_id,
  class_name = EXCLUDED.class_name,
  capacity = EXCLUDED.capacity,
  status = EXCLUDED.status;

INSERT INTO class_schedules (
  id,
  class_id,
  room_id,
  day_of_week,
  start_time,
  end_time
) VALUES
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '66666666-6666-6666-6666-666666666661',
    'monday',
    '08:00',
    '09:40'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '66666666-6666-6666-6666-666666666662',
    'tuesday',
    '10:00',
    '11:40'
  )
ON CONFLICT (id) DO UPDATE SET
  class_id = EXCLUDED.class_id,
  room_id = EXCLUDED.room_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;

INSERT INTO student_advisors (id, student_id, lecturer_id, academic_year_id)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '99999999-9999-9999-9999-999999999991',
    '88888888-8888-8888-8888-888888888882',
    '33333333-3333-3333-3333-333333333333'
  )
ON CONFLICT (student_id, academic_year_id) DO UPDATE SET
  lecturer_id = EXCLUDED.lecturer_id;
