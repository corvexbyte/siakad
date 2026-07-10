-- Seed data for demo/testing
-- Run AFTER migrations. Demo users use password `password123`.
-- NOTE: Auth is manual (custom cookie session + users table). NOT using Supabase Auth.
-- Idempotent: every INSERT upserts on the table's natural unique key (or id where
-- no other unique key exists), so this file can be re-run safely against a DB that
-- already has this seed applied.
--
-- Demo logins (all use password123):
--   admin@siakad.demo      - Super Admin
--   akademik@siakad.demo   - Admin Akademik
--   kaprodi@siakad.demo    - Kaprodi TI (also lecturer 01010001)
--   dosen@siakad.demo      - Dr. Budi Santoso (also lecturer 01010002, Ahmad Fauzi's advisor)
--   mahasiswa@siakad.demo  - Ahmad Fauzi (student 24010001)
--   dosen3..dosen15@siakad.demo    - 13 more lecturers across study programs
--   mahasiswa2..mahasiswa20@siakad.demo - 19 more students across study programs

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

-- ============================================================
-- FACULTIES (10)
-- ============================================================
INSERT INTO faculties (id, code, name) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'FTI', 'Fakultas Teknologi Informasi'),
  ('47dc80d3-d0a4-c25d-b4f4-e39d17ad40d3'::uuid, 'FEB', 'Fakultas Ekonomi dan Bisnis'),
  ('6482bc81-3c29-cbd4-e55c-d5db88b69091'::uuid, 'FH', 'Fakultas Hukum'),
  ('0cb6897c-b07b-5d8d-539f-7b486dbef3c5'::uuid, 'FK', 'Fakultas Kedokteran'),
  ('ef27e54c-ff48-e2c0-ae3f-9924613ea03b'::uuid, 'FISIP', 'Fakultas Ilmu Sosial dan Ilmu Politik'),
  ('9e00b394-b191-1f92-fd4a-e90c7040bc79'::uuid, 'FT', 'Fakultas Teknik'),
  ('3d97c1d4-a337-da16-0b91-7435895fe0bc'::uuid, 'FMIPA', 'Fakultas Matematika dan Ilmu Pengetahuan Alam'),
  ('c0fe9884-dbff-270e-3522-75fd6cfaf608'::uuid, 'FIB', 'Fakultas Ilmu Budaya'),
  ('0f8b6863-389d-f393-2865-3b6830f0c203'::uuid, 'FPSI', 'Fakultas Psikologi'),
  ('dab50934-4ec8-3ba7-3271-b7290a262972'::uuid, 'FKIP', 'Fakultas Keguruan dan Ilmu Pendidikan')
ON CONFLICT (code) DO UPDATE SET
  id   = EXCLUDED.id,
  name = EXCLUDED.name;

-- ============================================================
-- STUDY PROGRAMS (15)
-- ============================================================
INSERT INTO study_programs (id, faculty_id, code, name, degree_level) VALUES
  ('22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'TI', 'Teknik Informatika', 'S1'),
  ('d110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'SI', 'Sistem Informasi', 'S1'),
  ('f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, '47dc80d3-d0a4-c25d-b4f4-e39d17ad40d3'::uuid, 'MJ', 'Manajemen', 'S1'),
  ('2424d4d3-6b03-6395-5fa2-32c93e915b1d'::uuid, '47dc80d3-d0a4-c25d-b4f4-e39d17ad40d3'::uuid, 'AK', 'Akuntansi', 'S1'),
  ('f3bbbc19-6235-74e9-882e-596b45d9810f'::uuid, '6482bc81-3c29-cbd4-e55c-d5db88b69091'::uuid, 'IH', 'Ilmu Hukum', 'S1'),
  ('36219360-5619-5b61-ec55-cb7c320889df'::uuid, '0cb6897c-b07b-5d8d-539f-7b486dbef3c5'::uuid, 'PD', 'Pendidikan Dokter', 'S1'),
  ('b7cd2f12-8a43-ffea-f874-19fd6ae94c4f'::uuid, 'ef27e54c-ff48-e2c0-ae3f-9924613ea03b'::uuid, 'HI', 'Hubungan Internasional', 'S1'),
  ('40b6885a-441a-2af0-c978-cb55252f8dbe'::uuid, 'ef27e54c-ff48-e2c0-ae3f-9924613ea03b'::uuid, 'IKOM', 'Ilmu Komunikasi', 'S1'),
  ('029525d9-d84d-3613-cf95-f00eff6ac879'::uuid, '9e00b394-b191-1f92-fd4a-e90c7040bc79'::uuid, 'TS', 'Teknik Sipil', 'S1'),
  ('17f297a9-af58-139f-922e-2b7cb7ff6ab9'::uuid, '9e00b394-b191-1f92-fd4a-e90c7040bc79'::uuid, 'TE', 'Teknik Elektro', 'S1'),
  ('b68d3fce-07b8-ed83-5c6e-b673c1ccb6f2'::uuid, '3d97c1d4-a337-da16-0b91-7435895fe0bc'::uuid, 'MAT', 'Matematika', 'S1'),
  ('d9fbac45-97b8-14a4-b1cd-c45a0c6558d2'::uuid, '3d97c1d4-a337-da16-0b91-7435895fe0bc'::uuid, 'FIS', 'Fisika', 'S1'),
  ('88a41bd5-b6c5-2db7-5f51-bebe08f1c2c4'::uuid, 'c0fe9884-dbff-270e-3522-75fd6cfaf608'::uuid, 'SAS', 'Sastra Inggris', 'S1'),
  ('464025f4-f01a-5df6-3996-305249d20f59'::uuid, '0f8b6863-389d-f393-2865-3b6830f0c203'::uuid, 'PSI', 'Psikologi', 'S1'),
  ('dd78b7a8-c350-c048-b251-5159ab71b41c'::uuid, 'dab50934-4ec8-3ba7-3271-b7290a262972'::uuid, 'PGSD', 'Pendidikan Guru SD', 'S1')
ON CONFLICT (code) DO UPDATE SET
  id           = EXCLUDED.id,
  faculty_id   = EXCLUDED.faculty_id,
  name         = EXCLUDED.name,
  degree_level = EXCLUDED.degree_level;

-- ============================================================
-- ACADEMIC YEARS (6)
-- ============================================================
INSERT INTO academic_years (id, year_label, is_active) VALUES
  ('916ff5c1-b9f1-46e3-2419-96095a12aa42'::uuid, '2020/2021', false),
  ('c5b558c9-6fcf-2b30-d8ab-f6f5603198ae'::uuid, '2021/2022', false),
  ('4381a368-9f94-911b-5f51-96c26a95436a'::uuid, '2022/2023', false),
  ('ac104388-97c7-25f7-e0ff-d00f1d1fe830'::uuid, '2023/2024', false),
  ('1e9656fc-5d90-e4f0-d6d9-a0bc55780416'::uuid, '2024/2025', false),
  ('33333333-3333-3333-3333-333333333333'::uuid, '2025/2026', true)
ON CONFLICT (year_label) DO UPDATE SET
  id        = EXCLUDED.id,
  is_active = EXCLUDED.is_active;

-- ============================================================
-- SEMESTERS (12)
-- ============================================================
INSERT INTO semesters (id, academic_year_id, name, semester_number, is_active) VALUES
  ('531ff9b2-3c80-5a97-8865-18fe4bbaad0b'::uuid, '916ff5c1-b9f1-46e3-2419-96095a12aa42'::uuid, 'Ganjil 2020/2021', 1, false),
  ('f264da83-203f-2c89-3647-43ff19891d5c'::uuid, '916ff5c1-b9f1-46e3-2419-96095a12aa42'::uuid, 'Genap 2020/2021', 2, false),
  ('5c2dd2c3-28c4-38fe-36de-9d43b20f53f1'::uuid, 'c5b558c9-6fcf-2b30-d8ab-f6f5603198ae'::uuid, 'Ganjil 2021/2022', 1, false),
  ('bf9d9534-a52b-4dfd-4826-b88bd9e05be8'::uuid, 'c5b558c9-6fcf-2b30-d8ab-f6f5603198ae'::uuid, 'Genap 2021/2022', 2, false),
  ('22bad03e-2766-c495-9369-99da2831ab7b'::uuid, '4381a368-9f94-911b-5f51-96c26a95436a'::uuid, 'Ganjil 2022/2023', 1, false),
  ('cb2db0f8-59f6-0dcd-610f-ccbb81c533a4'::uuid, '4381a368-9f94-911b-5f51-96c26a95436a'::uuid, 'Genap 2022/2023', 2, false),
  ('7ed759d1-2870-0579-5e8b-bad0e862e144'::uuid, 'ac104388-97c7-25f7-e0ff-d00f1d1fe830'::uuid, 'Ganjil 2023/2024', 1, false),
  ('2e0cfd9b-b8b6-1e57-db9f-8f8bc4bc7f0f'::uuid, 'ac104388-97c7-25f7-e0ff-d00f1d1fe830'::uuid, 'Genap 2023/2024', 2, false),
  ('ca7f5efd-072c-c8f4-34b8-070b7bb44437'::uuid, '1e9656fc-5d90-e4f0-d6d9-a0bc55780416'::uuid, 'Ganjil 2024/2025', 1, false),
  ('2f7650b9-57a7-c061-b8f4-eba98d2ec17c'::uuid, '1e9656fc-5d90-e4f0-d6d9-a0bc55780416'::uuid, 'Genap 2024/2025', 2, false),
  ('44444444-4444-4444-4444-444444444444'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Ganjil 2025/2026', 1, true),
  ('4b7a70e3-efe3-0f97-7277-cfac0fe683fa'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Genap 2025/2026', 2, false)
ON CONFLICT (academic_year_id, semester_number) DO UPDATE SET
  id        = EXCLUDED.id,
  name      = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- ============================================================
-- CURRICULUMS (15, one per study program)
-- ============================================================
INSERT INTO curriculums (id, study_program_id, name, year, is_active) VALUES
  ('55555555-5555-5555-5555-555555555555'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Kurikulum 2024', 2024, true),
  ('f7edda0a-06d6-2d94-5fe0-e9f5cca5897c'::uuid, 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 'Kurikulum 2024', 2024, true),
  ('af990f4a-877f-947f-26f9-fc6b6752c1bf'::uuid, 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 'Kurikulum 2024', 2024, true),
  ('adf65814-2c13-c4f1-39f3-5761ced72cbe'::uuid, '2424d4d3-6b03-6395-5fa2-32c93e915b1d'::uuid, 'Kurikulum 2024', 2024, true),
  ('6f88b021-77cf-f39d-a742-7dc10fd89c47'::uuid, 'f3bbbc19-6235-74e9-882e-596b45d9810f'::uuid, 'Kurikulum 2024', 2024, true),
  ('792c551c-793d-df26-4412-fe92f6f86504'::uuid, '36219360-5619-5b61-ec55-cb7c320889df'::uuid, 'Kurikulum 2024', 2024, true),
  ('20e4ccb2-382f-ee58-201c-4f7b96e37f97'::uuid, 'b7cd2f12-8a43-ffea-f874-19fd6ae94c4f'::uuid, 'Kurikulum 2024', 2024, true),
  ('97e236e3-df69-798d-9082-4e4a6b9da521'::uuid, '40b6885a-441a-2af0-c978-cb55252f8dbe'::uuid, 'Kurikulum 2024', 2024, true),
  ('83f4a088-7b5f-369c-b13f-34ac7b5a09bf'::uuid, '029525d9-d84d-3613-cf95-f00eff6ac879'::uuid, 'Kurikulum 2024', 2024, true),
  ('444faca8-1eb4-475a-443d-6a5d8340a7f8'::uuid, '17f297a9-af58-139f-922e-2b7cb7ff6ab9'::uuid, 'Kurikulum 2024', 2024, true),
  ('9b690351-5883-c7ac-1893-934d2598309b'::uuid, 'b68d3fce-07b8-ed83-5c6e-b673c1ccb6f2'::uuid, 'Kurikulum 2024', 2024, true),
  ('f7bbedf1-17ea-70b2-ff9b-45f86d687ac1'::uuid, 'd9fbac45-97b8-14a4-b1cd-c45a0c6558d2'::uuid, 'Kurikulum 2024', 2024, true),
  ('57abf3e7-ae3f-842d-6e54-c2e37bda60a1'::uuid, '88a41bd5-b6c5-2db7-5f51-bebe08f1c2c4'::uuid, 'Kurikulum 2024', 2024, true),
  ('a1e750b1-c0b3-383c-290f-cd679da2bcf5'::uuid, '464025f4-f01a-5df6-3996-305249d20f59'::uuid, 'Kurikulum 2024', 2024, true),
  ('a2663149-a41d-fbbd-478b-40a85af83dbe'::uuid, 'dd78b7a8-c350-c048-b251-5159ab71b41c'::uuid, 'Kurikulum 2024', 2024, true)
ON CONFLICT (id) DO UPDATE SET
  study_program_id = EXCLUDED.study_program_id,
  name             = EXCLUDED.name,
  year             = EXCLUDED.year;

-- ============================================================
-- ROOMS (15)
-- ============================================================
INSERT INTO rooms (id, code, name, capacity, building) VALUES
  ('66666666-6666-6666-6666-666666666661'::uuid, 'A101', 'Ruang A101', 40, 'Gedung A'),
  ('66666666-6666-6666-6666-666666666662'::uuid, 'B201', 'Lab Komputer B201', 30, 'Gedung B'),
  ('049aae42-9474-a99f-5e46-d33b259e3cce'::uuid, 'A102', 'Ruang A102', 40, 'Gedung A'),
  ('a8ba1a66-ed79-4ab3-c7f8-23e6780b1099'::uuid, 'A103', 'Ruang A103', 45, 'Gedung A'),
  ('68bef272-2be3-935c-8a07-0f4c2cd22182'::uuid, 'A201', 'Ruang A201', 40, 'Gedung A'),
  ('158e5c7c-b194-30c5-4f45-4f099508bab7'::uuid, 'B101', 'Ruang B101', 35, 'Gedung B'),
  ('2f777f90-c100-0474-1972-73a2cab198f5'::uuid, 'B202', 'Lab Jaringan B202', 25, 'Gedung B'),
  ('15a3b40a-1761-d456-026e-ba4a3e1a2c8e'::uuid, 'B203', 'Lab Multimedia B203', 25, 'Gedung B'),
  ('cf0958df-d81e-fd09-9e75-eb8a908cfc93'::uuid, 'C101', 'Ruang C101', 50, 'Gedung C'),
  ('6d4923e7-df91-6f2c-11b6-6d75b6f82cce'::uuid, 'C102', 'Ruang C102', 50, 'Gedung C'),
  ('5a9995a9-a832-4c00-21ff-44026d85b12e'::uuid, 'C201', 'Aula C201', 100, 'Gedung C'),
  ('137c6fd2-1e7c-afa0-2ec6-b85d22a7dde2'::uuid, 'D101', 'Ruang D101', 40, 'Gedung D'),
  ('56aee23b-527e-732b-1c98-cb22b20f7f4b'::uuid, 'D102', 'Ruang D102', 40, 'Gedung D'),
  ('fcc801a6-cb22-67ea-6dec-0639b93b84ec'::uuid, 'D201', 'Lab Bahasa D201', 30, 'Gedung D'),
  ('9bde7677-e5a3-027d-7f5f-90670acce6e0'::uuid, 'D202', 'Lab Fisika D202', 30, 'Gedung D')
ON CONFLICT (code) DO UPDATE SET
  id       = EXCLUDED.id,
  name     = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  building = EXCLUDED.building;

-- ============================================================
-- COURSES (20)
-- ============================================================
INSERT INTO courses (id, course_code, course_name, credits, semester_recommended, study_program_id, curriculum_id) VALUES
  ('77777777-7777-7777-7777-777777777771'::uuid, 'TI101', 'Algoritma dan Pemrograman', 3, 1, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('77777777-7777-7777-7777-777777777772'::uuid, 'TI102', 'Struktur Data', 3, 2, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('77777777-7777-7777-7777-777777777773'::uuid, 'TI201', 'Basis Data', 3, 3, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('77777777-7777-7777-7777-777777777774'::uuid, 'TI202', 'Pemrograman Web', 3, 4, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('5f67991b-86e6-5ae2-c871-dbd777c45824'::uuid, 'TI203', 'Jaringan Komputer', 3, 4, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('cb0a3436-eefb-0791-9919-16ae2deec950'::uuid, 'TI204', 'Sistem Operasi', 3, 3, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('31dc115a-1be8-a554-8897-ea0cc6e5f497'::uuid, 'TI301', 'Kecerdasan Buatan', 3, 5, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('3c4b2ba0-5ff7-49ea-f27f-e6d604ab8c63'::uuid, 'TI302', 'Rekayasa Perangkat Lunak', 3, 5, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('2459f672-c4a6-c155-19c0-3e6c16e4e300'::uuid, 'TI303', 'Keamanan Siber', 3, 6, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('11d7ca96-e366-f155-7ee1-815d2a6f027e'::uuid, 'TI304', 'Pemrograman Mobile', 3, 6, '22222222-2222-2222-2222-222222222222'::uuid, '55555555-5555-5555-5555-555555555555'::uuid),
  ('3256aa87-02c0-b14e-1d0d-2be5ef152c44'::uuid, 'SI101', 'Pengantar Sistem Informasi', 3, 1, 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 'f7edda0a-06d6-2d94-5fe0-e9f5cca5897c'::uuid),
  ('058cdea3-4c63-9e07-066f-f355a06ba835'::uuid, 'SI201', 'Analisis dan Perancangan Sistem', 3, 3, 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 'f7edda0a-06d6-2d94-5fe0-e9f5cca5897c'::uuid),
  ('2dce8a0c-9287-2ebc-6c7e-3446cff9f304'::uuid, 'SI202', 'Manajemen Proyek TI', 3, 4, 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 'f7edda0a-06d6-2d94-5fe0-e9f5cca5897c'::uuid),
  ('7b96c9fa-f908-fa0e-370a-43221772cd27'::uuid, 'SI301', 'Enterprise Resource Planning', 3, 5, 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 'f7edda0a-06d6-2d94-5fe0-e9f5cca5897c'::uuid),
  ('1d3b1532-dad7-9153-ca16-e2c0dce371ad'::uuid, 'MJ101', 'Pengantar Manajemen', 3, 1, 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 'af990f4a-877f-947f-26f9-fc6b6752c1bf'::uuid),
  ('f8992234-d2c8-7a5b-970f-12a28131c8a4'::uuid, 'MJ201', 'Manajemen Pemasaran', 3, 3, 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 'af990f4a-877f-947f-26f9-fc6b6752c1bf'::uuid),
  ('7aaf23b6-fffd-8ef3-67fe-aadd00da84f1'::uuid, 'MJ202', 'Manajemen Keuangan', 3, 4, 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 'af990f4a-877f-947f-26f9-fc6b6752c1bf'::uuid),
  ('b4ef855f-cbb4-1d09-a07d-b7d9dfbcb4f1'::uuid, 'AK101', 'Pengantar Akuntansi', 3, 1, '2424d4d3-6b03-6395-5fa2-32c93e915b1d'::uuid, 'adf65814-2c13-c4f1-39f3-5761ced72cbe'::uuid),
  ('899a00ac-8da5-7bf2-343d-56d59b13e3e7'::uuid, 'AK201', 'Akuntansi Keuangan Menengah', 3, 3, '2424d4d3-6b03-6395-5fa2-32c93e915b1d'::uuid, 'adf65814-2c13-c4f1-39f3-5761ced72cbe'::uuid),
  ('8f64667e-2510-f295-9ffd-e06f8ae53cb1'::uuid, 'IH101', 'Pengantar Ilmu Hukum', 3, 1, 'f3bbbc19-6235-74e9-882e-596b45d9810f'::uuid, '6f88b021-77cf-f39d-a742-7dc10fd89c47'::uuid)
ON CONFLICT (course_code) DO UPDATE SET
  id                   = EXCLUDED.id,
  course_name          = EXCLUDED.course_name,
  credits              = EXCLUDED.credits,
  semester_recommended = EXCLUDED.semester_recommended,
  study_program_id     = EXCLUDED.study_program_id,
  curriculum_id        = EXCLUDED.curriculum_id;

-- ============================================================
-- USERS: DOSEN (13 additional, 2 already exist)
-- ============================================================
INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at) VALUES
  ('4a814bb6-c95b-653a-0986-98243938cc13'::uuid, 'Ir. Agus Prasetyo, M.Kom', 'dosen3@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('0ea75d60-b5ff-8cfa-c5fe-7593ff19b676'::uuid, 'Dr. Dewi Lestari', 'dosen4@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('2d7ac7da-6410-caa0-02b6-358ec5e9e4c4'::uuid, 'Prof. Hendra Wijaya', 'dosen5@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('ca8dd970-274c-0012-11c3-c2a2f5a6047e'::uuid, 'Dr. Rina Marlina', 'dosen6@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('87137562-16f0-0b6d-004b-7c950e63907c'::uuid, 'Ir. Bambang Sutrisno, M.T', 'dosen7@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('cdd66494-d0d9-f783-b1d7-214ef4b26c64'::uuid, 'Dr. Yuni Astuti', 'dosen8@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('c23762d7-6f75-c286-9e84-893eda2c7cdf'::uuid, 'Dr. Fajar Nugroho', 'dosen9@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('62cf6a95-732a-38bf-dd2a-81cb635538d9'::uuid, 'Ir. Sri Wahyuni, M.Kom', 'dosen10@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('17b13718-c7f9-82ea-6bc5-3f61e46d1ed2'::uuid, 'Dr. Tono Kurniawan', 'dosen11@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('49ec2d69-6696-965c-d75e-90fef6cc96b1'::uuid, 'Dr. Ratna Sari', 'dosen12@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('f78c3d8a-983c-a2b9-5dc8-55173685cee2'::uuid, 'Prof. Wahyu Hidayat', 'dosen13@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('b4f75317-15ef-1ed4-9e68-a40d2d7a08df'::uuid, 'Dr. Indah Permata', 'dosen14@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now()),
  ('0d66dc74-5d39-f17a-82a6-725b58cadef8'::uuid, 'Ir. Joko Susilo, M.T', 'dosen15@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'dosen'::user_role, true, now(), now())
ON CONFLICT (email) DO UPDATE SET
  id        = EXCLUDED.id,
  full_name = EXCLUDED.full_name;

-- ============================================================
-- LECTURERS (15)
-- ============================================================
INSERT INTO lecturers (id, profile_id, lecturer_number, study_program_id, expertise) VALUES
  ('88888888-8888-8888-8888-888888888881'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac'::uuid, '01010001', '22222222-2222-2222-2222-222222222222'::uuid, 'Rekayasa Perangkat Lunak'),
  ('88888888-8888-8888-8888-888888888882'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad'::uuid, '01010002', '22222222-2222-2222-2222-222222222222'::uuid, 'Sistem Basis Data'),
  ('01c51be3-9a3f-09ff-4886-797ca7762595'::uuid, '4a814bb6-c95b-653a-0986-98243938cc13'::uuid, '01010003', '22222222-2222-2222-2222-222222222222'::uuid, 'Jaringan Komputer'),
  ('c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, '0ea75d60-b5ff-8cfa-c5fe-7593ff19b676'::uuid, '01010004', '22222222-2222-2222-2222-222222222222'::uuid, 'Kecerdasan Buatan'),
  ('521cd85c-106d-d37c-5f52-b5f4caf56269'::uuid, '2d7ac7da-6410-caa0-02b6-358ec5e9e4c4'::uuid, '01010005', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 'Manajemen Proyek TI'),
  ('a7ab8d4a-7ecc-d79b-64bb-ca26880c3e5d'::uuid, 'ca8dd970-274c-0012-11c3-c2a2f5a6047e'::uuid, '01010006', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 'Keamanan Siber'),
  ('94fe58fb-ede0-e4a5-de25-f37d12c88851'::uuid, '87137562-16f0-0b6d-004b-7c950e63907c'::uuid, '01010007', 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 'Sistem Informasi'),
  ('494e4588-29ea-32d0-260b-8ec98f0a46a7'::uuid, 'cdd66494-d0d9-f783-b1d7-214ef4b26c64'::uuid, '01010008', 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 'Manajemen Pemasaran'),
  ('ff993071-5804-8065-ad3b-8aafedc6008c'::uuid, 'c23762d7-6f75-c286-9e84-893eda2c7cdf'::uuid, '01010009', '2424d4d3-6b03-6395-5fa2-32c93e915b1d'::uuid, 'Akuntansi Keuangan'),
  ('2ae198bb-99fc-9eea-a264-efc138f26a2c'::uuid, '62cf6a95-732a-38bf-dd2a-81cb635538d9'::uuid, '01010010', 'f3bbbc19-6235-74e9-882e-596b45d9810f'::uuid, 'Hukum Perdata'),
  ('1e536ef1-72fc-6486-98ed-b867b744fdb6'::uuid, '17b13718-c7f9-82ea-6bc5-3f61e46d1ed2'::uuid, '01010011', 'b68d3fce-07b8-ed83-5c6e-b673c1ccb6f2'::uuid, 'Matematika Terapan'),
  ('079a8856-e7ea-1d72-a6c1-ee4caccdc4a2'::uuid, '49ec2d69-6696-965c-d75e-90fef6cc96b1'::uuid, '01010012', 'd9fbac45-97b8-14a4-b1cd-c45a0c6558d2'::uuid, 'Fisika Terapan'),
  ('24215308-57b4-9cbc-1459-6c189030ec41'::uuid, 'f78c3d8a-983c-a2b9-5dc8-55173685cee2'::uuid, '01010013', '40b6885a-441a-2af0-c978-cb55252f8dbe'::uuid, 'Ilmu Komunikasi'),
  ('11f94c8e-9bc2-878d-982f-17484f7da07b'::uuid, 'b4f75317-15ef-1ed4-9e68-a40d2d7a08df'::uuid, '01010014', '464025f4-f01a-5df6-3996-305249d20f59'::uuid, 'Psikologi Pendidikan'),
  ('e6f2418a-aca1-d51c-0ed7-1532533f34f0'::uuid, '0d66dc74-5d39-f17a-82a6-725b58cadef8'::uuid, '01010015', '029525d9-d84d-3613-cf95-f00eff6ac879'::uuid, 'Teknik Sipil')
ON CONFLICT (lecturer_number) DO UPDATE SET
  id               = EXCLUDED.id,
  profile_id       = EXCLUDED.profile_id,
  study_program_id = EXCLUDED.study_program_id,
  expertise        = EXCLUDED.expertise;

-- ============================================================
-- USERS: MAHASISWA (19 additional, 1 already exists)
-- ============================================================
INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at) VALUES
  ('17d30833-bdd9-0ca4-d30b-a725475b6e83'::uuid, 'Bunga Citra Dewi', 'mahasiswa2@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('a1fec852-6199-6c58-125b-9e0f3582e926'::uuid, 'Chandra Wijaya', 'mahasiswa3@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('fd251dab-9986-9bf2-0eff-d873d1267e29'::uuid, 'Dian Puspita', 'mahasiswa4@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('ac2d6565-3ad2-8a1b-01cf-1893d97a1671'::uuid, 'Eko Prasetyo', 'mahasiswa5@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('af85610c-9591-c581-7736-ace59f3e500a'::uuid, 'Fitri Handayani', 'mahasiswa6@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('c7035db8-ae9d-e028-7cb3-87336a022997'::uuid, 'Gilang Ramadhan', 'mahasiswa7@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('2e7e8626-2c09-e32c-eba6-aac23f7f01d4'::uuid, 'Hesti Nuraini', 'mahasiswa8@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('ec457410-b13d-9577-b39d-6bcc58d26cf4'::uuid, 'Indra Kusuma', 'mahasiswa9@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('9f28c576-2e61-5982-55d6-42a1c18bd8b7'::uuid, 'Jasmine Putri', 'mahasiswa10@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('5435add5-c219-772b-808e-3c092a02d25e'::uuid, 'Kevin Saputra', 'mahasiswa11@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('730a9350-b2a8-b8eb-0158-597044670624'::uuid, 'Lestari Wulandari', 'mahasiswa12@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('e9867ce3-d5dc-4a16-6710-1b229cba1bed'::uuid, 'Muhammad Rizki', 'mahasiswa13@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('b3f28a9f-adff-39e1-e6be-2ac12ae5a55f'::uuid, 'Nadia Salsabila', 'mahasiswa14@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('90a7a6ae-0987-adbc-930c-ead1480b442a'::uuid, 'Oscar Pratama', 'mahasiswa15@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('3a70de5f-575c-5c78-8272-1ff4f944786c'::uuid, 'Putri Amelia', 'mahasiswa16@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('ca9ba0e4-b5cf-3702-b727-b1c2ea13d1d8'::uuid, 'Rangga Aditya', 'mahasiswa17@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('b3ab2e94-428a-fd31-9c4b-5260fd2d51e7'::uuid, 'Sarah Aulia', 'mahasiswa18@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('fe80302f-f57f-9355-c224-80d9fee0d12c'::uuid, 'Taufik Hidayat', 'mahasiswa19@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now()),
  ('816980bd-a072-1bbd-0423-39a32627e8a9'::uuid, 'Umi Kalsum', 'mahasiswa20@siakad.demo', extensions.crypt('password123', extensions.gen_salt('bf')), 'mahasiswa'::user_role, true, now(), now())
ON CONFLICT (email) DO UPDATE SET
  id        = EXCLUDED.id,
  full_name = EXCLUDED.full_name;

-- ============================================================
-- STUDENTS (20)
-- ============================================================
INSERT INTO students (id, profile_id, student_number, study_program_id, entry_year, academic_status, current_semester) VALUES
  ('99999999-9999-9999-9999-999999999991'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae'::uuid, '24010001', '22222222-2222-2222-2222-222222222222'::uuid, 2024, 'active'::academic_status, 3),
  ('bcdda7c8-0bae-c096-b676-76edad81bacf'::uuid, '17d30833-bdd9-0ca4-d30b-a725475b6e83'::uuid, '24010002', '22222222-2222-2222-2222-222222222222'::uuid, 2024, 'active'::academic_status, 3),
  ('609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, 'a1fec852-6199-6c58-125b-9e0f3582e926'::uuid, '23010003', '22222222-2222-2222-2222-222222222222'::uuid, 2023, 'active'::academic_status, 5),
  ('219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, 'fd251dab-9986-9bf2-0eff-d873d1267e29'::uuid, '23010004', '22222222-2222-2222-2222-222222222222'::uuid, 2023, 'active'::academic_status, 5),
  ('8ba48f37-90fb-acd3-7500-43da5ee3dfd2'::uuid, 'ac2d6565-3ad2-8a1b-01cf-1893d97a1671'::uuid, '22010005', '22222222-2222-2222-2222-222222222222'::uuid, 2022, 'active'::academic_status, 7),
  ('d0128f1a-77ab-4d8e-f247-699863292574'::uuid, 'af85610c-9591-c581-7736-ace59f3e500a'::uuid, '22010006', '22222222-2222-2222-2222-222222222222'::uuid, 2022, 'active'::academic_status, 7),
  ('d0538330-878a-7e6b-c00c-cb37f47f6a1a'::uuid, 'c7035db8-ae9d-e028-7cb3-87336a022997'::uuid, '24020007', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 2024, 'active'::academic_status, 3),
  ('54fa8324-c892-4293-e731-a166237f2ef3'::uuid, '2e7e8626-2c09-e32c-eba6-aac23f7f01d4'::uuid, '23020008', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 2023, 'active'::academic_status, 5),
  ('94cea4fd-0635-ff9d-6c6b-ef26a03d27b2'::uuid, 'ec457410-b13d-9577-b39d-6bcc58d26cf4'::uuid, '22020009', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 2022, 'active'::academic_status, 7),
  ('981eb403-b97b-0905-4753-b59a0afc2d48'::uuid, '9f28c576-2e61-5982-55d6-42a1c18bd8b7'::uuid, '21020010', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 2021, 'leave'::academic_status, 8),
  ('db8f5cf3-61a6-0fdd-7e7e-565ccfb318c1'::uuid, '5435add5-c219-772b-808e-3c092a02d25e'::uuid, '24030011', 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 2024, 'active'::academic_status, 3),
  ('7434bb00-578f-e0d9-ea13-43c2f74b46ae'::uuid, '730a9350-b2a8-b8eb-0158-597044670624'::uuid, '23030012', 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 2023, 'active'::academic_status, 5),
  ('c48baa6f-acc2-3e1b-2bca-bbf6cbf12f71'::uuid, 'e9867ce3-d5dc-4a16-6710-1b229cba1bed'::uuid, '22040013', '2424d4d3-6b03-6395-5fa2-32c93e915b1d'::uuid, 2022, 'active'::academic_status, 7),
  ('1fd36942-15c1-6f50-4814-c215a7415507'::uuid, 'b3f28a9f-adff-39e1-e6be-2ac12ae5a55f'::uuid, '21040014', '2424d4d3-6b03-6395-5fa2-32c93e915b1d'::uuid, 2021, 'graduated'::academic_status, 8),
  ('0eabea25-cd40-6d70-88b5-26068b74ba49'::uuid, '90a7a6ae-0987-adbc-930c-ead1480b442a'::uuid, '24050015', 'f3bbbc19-6235-74e9-882e-596b45d9810f'::uuid, 2024, 'active'::academic_status, 3),
  ('c2ad9578-ccc2-768d-4e7b-eeebea84a669'::uuid, '3a70de5f-575c-5c78-8272-1ff4f944786c'::uuid, '23010016', '22222222-2222-2222-2222-222222222222'::uuid, 2023, 'active'::academic_status, 5),
  ('88f5401c-86a4-e628-a718-7f7f36b84965'::uuid, 'ca9ba0e4-b5cf-3702-b727-b1c2ea13d1d8'::uuid, '22020017', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 2022, 'active'::academic_status, 7),
  ('23ffdd84-c9de-9eb4-2802-1bfcda4d6b34'::uuid, 'b3ab2e94-428a-fd31-9c4b-5260fd2d51e7'::uuid, '21030018', 'f2505d81-a578-62cb-8c63-1b4a9dec65ea'::uuid, 2021, 'active'::academic_status, 8),
  ('7d8a35cf-8def-cd87-e1d6-89d30de22773'::uuid, 'fe80302f-f57f-9355-c224-80d9fee0d12c'::uuid, '24010019', '22222222-2222-2222-2222-222222222222'::uuid, 2024, 'dropout'::academic_status, 3),
  ('a291d900-2ae0-ab2d-3ed1-1baf961f8b86'::uuid, '816980bd-a072-1bbd-0423-39a32627e8a9'::uuid, '23020020', 'd110579a-fa63-6882-51aa-aa9e8168ad60'::uuid, 2023, 'active'::academic_status, 5)
ON CONFLICT (student_number) DO UPDATE SET
  id               = EXCLUDED.id,
  profile_id       = EXCLUDED.profile_id,
  study_program_id = EXCLUDED.study_program_id,
  entry_year       = EXCLUDED.entry_year,
  academic_status  = EXCLUDED.academic_status,
  current_semester = EXCLUDED.current_semester;

-- ============================================================
-- CLASSES (20, one per course, active semester)
-- ============================================================
INSERT INTO classes (id, course_id, lecturer_id, academic_year_id, semester_id, class_name, capacity, status) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid, '77777777-7777-7777-7777-777777777771'::uuid, '88888888-8888-8888-8888-888888888881'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid, '77777777-7777-7777-7777-777777777772'::uuid, '88888888-8888-8888-8888-888888888882'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('ca89b149-f5d8-3346-34f3-0e8c14440dc0'::uuid, '77777777-7777-7777-7777-777777777773'::uuid, '01c51be3-9a3f-09ff-4886-797ca7762595'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('10eee011-da15-2fe1-a509-e4fd4c733e64'::uuid, '77777777-7777-7777-7777-777777777774'::uuid, 'c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('41b19aaf-0f6b-b970-59c1-05fb632468b3'::uuid, '5f67991b-86e6-5ae2-c871-dbd777c45824'::uuid, '521cd85c-106d-d37c-5f52-b5f4caf56269'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('ccf1d2ef-da4e-fba1-fc0b-89d882842357'::uuid, 'cb0a3436-eefb-0791-9919-16ae2deec950'::uuid, 'a7ab8d4a-7ecc-d79b-64bb-ca26880c3e5d'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('dd3c1109-675c-c8c5-0ecb-685387e6a046'::uuid, '31dc115a-1be8-a554-8897-ea0cc6e5f497'::uuid, '94fe58fb-ede0-e4a5-de25-f37d12c88851'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('efbbedc0-72f8-3d1c-db32-ae848f6c9803'::uuid, '3c4b2ba0-5ff7-49ea-f27f-e6d604ab8c63'::uuid, '494e4588-29ea-32d0-260b-8ec98f0a46a7'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('dc7ebd84-07e6-0c14-e563-57eb4a49f2e5'::uuid, '2459f672-c4a6-c155-19c0-3e6c16e4e300'::uuid, 'ff993071-5804-8065-ad3b-8aafedc6008c'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('b2b99e4f-1784-77f3-c998-07c5a6b4b9be'::uuid, '11d7ca96-e366-f155-7ee1-815d2a6f027e'::uuid, '2ae198bb-99fc-9eea-a264-efc138f26a2c'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('de610dc2-6feb-191a-0567-f157b6ab69fc'::uuid, '3256aa87-02c0-b14e-1d0d-2be5ef152c44'::uuid, '1e536ef1-72fc-6486-98ed-b867b744fdb6'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('2ed96bbd-5f6d-fe3c-2097-44d6b152b62d'::uuid, '058cdea3-4c63-9e07-066f-f355a06ba835'::uuid, '079a8856-e7ea-1d72-a6c1-ee4caccdc4a2'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('2528253b-fea1-62e7-00fc-c013d9edacf6'::uuid, '2dce8a0c-9287-2ebc-6c7e-3446cff9f304'::uuid, '24215308-57b4-9cbc-1459-6c189030ec41'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('659a3a7e-c63c-f013-3830-1f486969c521'::uuid, '7b96c9fa-f908-fa0e-370a-43221772cd27'::uuid, '11f94c8e-9bc2-878d-982f-17484f7da07b'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('944a3c5a-4064-82fa-dfd7-364555c3496a'::uuid, '1d3b1532-dad7-9153-ca16-e2c0dce371ad'::uuid, 'e6f2418a-aca1-d51c-0ed7-1532533f34f0'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('7e51dff0-96f9-e5c4-fec8-cb26d18d0944'::uuid, 'f8992234-d2c8-7a5b-970f-12a28131c8a4'::uuid, '88888888-8888-8888-8888-888888888881'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('8edebf58-69d2-a048-b0cc-ae7fb98be56b'::uuid, '7aaf23b6-fffd-8ef3-67fe-aadd00da84f1'::uuid, '88888888-8888-8888-8888-888888888882'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('2ad95bd2-372c-38ae-c14a-6992624011df'::uuid, 'b4ef855f-cbb4-1d09-a07d-b7d9dfbcb4f1'::uuid, '01c51be3-9a3f-09ff-4886-797ca7762595'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('b89dada1-9309-e13a-842a-6a638707fa88'::uuid, '899a00ac-8da5-7bf2-343d-56d59b13e3e7'::uuid, 'c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status),
  ('34b6930f-b7f6-86e3-5915-d77ff1cd5646'::uuid, '8f64667e-2510-f295-9ffd-e06f8ae53cb1'::uuid, '521cd85c-106d-d37c-5f52-b5f4caf56269'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'A', 40, 'open'::class_status)
ON CONFLICT (id) DO UPDATE SET
  lecturer_id = EXCLUDED.lecturer_id,
  capacity    = EXCLUDED.capacity,
  status      = EXCLUDED.status;

-- ============================================================
-- CLASS SCHEDULES (20, one per class, conflict-free room/day/time)
-- ============================================================
INSERT INTO class_schedules (id, class_id, room_id, day_of_week, start_time, end_time) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc01'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid, '66666666-6666-6666-6666-666666666661'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid, '66666666-6666-6666-6666-666666666662'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('8e02adb1-e74d-2700-7cc3-22b903b03353'::uuid, 'ca89b149-f5d8-3346-34f3-0e8c14440dc0'::uuid, '049aae42-9474-a99f-5e46-d33b259e3cce'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('2a53f576-3e8a-b4f4-f8ab-b3d123c56a3b'::uuid, '10eee011-da15-2fe1-a509-e4fd4c733e64'::uuid, 'a8ba1a66-ed79-4ab3-c7f8-23e6780b1099'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('445ef637-f0dc-dca1-21a7-bc6ac8d38db6'::uuid, '41b19aaf-0f6b-b970-59c1-05fb632468b3'::uuid, '68bef272-2be3-935c-8a07-0f4c2cd22182'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('fa67a942-2340-c9a3-21cb-04ea4cf70585'::uuid, 'ccf1d2ef-da4e-fba1-fc0b-89d882842357'::uuid, '158e5c7c-b194-30c5-4f45-4f099508bab7'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('6048bb0a-6eb6-b069-659a-2279eabc56fb'::uuid, 'dd3c1109-675c-c8c5-0ecb-685387e6a046'::uuid, '2f777f90-c100-0474-1972-73a2cab198f5'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('84e8211e-de22-6858-5de6-db104d950703'::uuid, 'efbbedc0-72f8-3d1c-db32-ae848f6c9803'::uuid, '15a3b40a-1761-d456-026e-ba4a3e1a2c8e'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('73cc7edd-2673-d05a-4795-05de18e65154'::uuid, 'dc7ebd84-07e6-0c14-e563-57eb4a49f2e5'::uuid, 'cf0958df-d81e-fd09-9e75-eb8a908cfc93'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('bdd02919-17bd-b9c4-166d-b4d9a5ec41d9'::uuid, 'b2b99e4f-1784-77f3-c998-07c5a6b4b9be'::uuid, '6d4923e7-df91-6f2c-11b6-6d75b6f82cce'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('eb81001b-d3e0-2559-03ab-cc043d6f3bc5'::uuid, 'de610dc2-6feb-191a-0567-f157b6ab69fc'::uuid, '5a9995a9-a832-4c00-21ff-44026d85b12e'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('2ff8c16e-fd9e-80f3-c5b7-1b712c7b4c4a'::uuid, '2ed96bbd-5f6d-fe3c-2097-44d6b152b62d'::uuid, '137c6fd2-1e7c-afa0-2ec6-b85d22a7dde2'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('beb17661-c271-8537-dda5-0d18ddc0f05b'::uuid, '2528253b-fea1-62e7-00fc-c013d9edacf6'::uuid, '56aee23b-527e-732b-1c98-cb22b20f7f4b'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('af58047b-c373-b4d8-4bb1-84c34c1a4aea'::uuid, '659a3a7e-c63c-f013-3830-1f486969c521'::uuid, 'fcc801a6-cb22-67ea-6dec-0639b93b84ec'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('44ad297f-8c69-f6ea-c1c8-043027cbff92'::uuid, '944a3c5a-4064-82fa-dfd7-364555c3496a'::uuid, '9bde7677-e5a3-027d-7f5f-90670acce6e0'::uuid, 'monday'::day_of_week, '08:00', '09:40'),
  ('ad2bace6-9930-6296-cea9-de5e678f5ee5'::uuid, '7e51dff0-96f9-e5c4-fec8-cb26d18d0944'::uuid, '66666666-6666-6666-6666-666666666661'::uuid, 'tuesday'::day_of_week, '08:00', '09:40'),
  ('e565843a-78fc-c309-f8d1-eb8dc58b369d'::uuid, '8edebf58-69d2-a048-b0cc-ae7fb98be56b'::uuid, '66666666-6666-6666-6666-666666666662'::uuid, 'tuesday'::day_of_week, '08:00', '09:40'),
  ('c2162522-976d-c758-fb5b-38f9854919b0'::uuid, '2ad95bd2-372c-38ae-c14a-6992624011df'::uuid, '049aae42-9474-a99f-5e46-d33b259e3cce'::uuid, 'tuesday'::day_of_week, '08:00', '09:40'),
  ('777af30d-3abe-229b-1b84-f9ba84586498'::uuid, 'b89dada1-9309-e13a-842a-6a638707fa88'::uuid, 'a8ba1a66-ed79-4ab3-c7f8-23e6780b1099'::uuid, 'tuesday'::day_of_week, '08:00', '09:40'),
  ('195b1850-77f6-18be-6073-088cbff27921'::uuid, '34b6930f-b7f6-86e3-5915-d77ff1cd5646'::uuid, '68bef272-2be3-935c-8a07-0f4c2cd22182'::uuid, 'tuesday'::day_of_week, '08:00', '09:40')
ON CONFLICT (id) DO UPDATE SET
  room_id     = EXCLUDED.room_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time  = EXCLUDED.start_time,
  end_time    = EXCLUDED.end_time;

-- ============================================================
-- STUDENT ADVISORS (20, one per student, active year)
-- ============================================================
INSERT INTO student_advisors (id, student_id, lecturer_id, academic_year_id) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddd01'::uuid, '99999999-9999-9999-9999-999999999991'::uuid, '88888888-8888-8888-8888-888888888882'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('e3758dc8-4c7f-f065-5c73-1dd603768738'::uuid, 'bcdda7c8-0bae-c096-b676-76edad81bacf'::uuid, '88888888-8888-8888-8888-888888888882'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('2f12c170-48fc-33f1-52b4-945b0306dc13'::uuid, '609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, '01c51be3-9a3f-09ff-4886-797ca7762595'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('7c4c92b7-a06f-e484-7562-ecad34fb1525'::uuid, '219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, 'c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('ab48be7f-a43b-e71b-03c8-601446a0f073'::uuid, '8ba48f37-90fb-acd3-7500-43da5ee3dfd2'::uuid, '521cd85c-106d-d37c-5f52-b5f4caf56269'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('bcfef4a0-7400-91d8-5593-3f50aeaf5a64'::uuid, 'd0128f1a-77ab-4d8e-f247-699863292574'::uuid, 'a7ab8d4a-7ecc-d79b-64bb-ca26880c3e5d'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('e6887d01-7be1-abad-36f6-b52952002ac3'::uuid, 'd0538330-878a-7e6b-c00c-cb37f47f6a1a'::uuid, '94fe58fb-ede0-e4a5-de25-f37d12c88851'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('573d1aaa-9fb7-193b-352c-8f8eb108078e'::uuid, '54fa8324-c892-4293-e731-a166237f2ef3'::uuid, '494e4588-29ea-32d0-260b-8ec98f0a46a7'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('0865cf36-2b5d-bb92-b917-93a51bd2c321'::uuid, '94cea4fd-0635-ff9d-6c6b-ef26a03d27b2'::uuid, 'ff993071-5804-8065-ad3b-8aafedc6008c'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('4f50349a-2f4f-c228-3be4-d6bf3185db79'::uuid, '981eb403-b97b-0905-4753-b59a0afc2d48'::uuid, '2ae198bb-99fc-9eea-a264-efc138f26a2c'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('a7c8fcbf-ec02-dfb9-f311-79596936b8cb'::uuid, 'db8f5cf3-61a6-0fdd-7e7e-565ccfb318c1'::uuid, '1e536ef1-72fc-6486-98ed-b867b744fdb6'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('73f16baa-7d7c-5dcc-b2a3-6cdbeaf040cf'::uuid, '7434bb00-578f-e0d9-ea13-43c2f74b46ae'::uuid, '079a8856-e7ea-1d72-a6c1-ee4caccdc4a2'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('e6b099e6-57e3-1c8f-aa52-44bd8693fdca'::uuid, 'c48baa6f-acc2-3e1b-2bca-bbf6cbf12f71'::uuid, '24215308-57b4-9cbc-1459-6c189030ec41'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('b5f6237d-d58a-4158-061c-b2c47862e770'::uuid, '1fd36942-15c1-6f50-4814-c215a7415507'::uuid, '11f94c8e-9bc2-878d-982f-17484f7da07b'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('1c57e789-f713-ef1a-433f-b432b4986415'::uuid, '0eabea25-cd40-6d70-88b5-26068b74ba49'::uuid, 'e6f2418a-aca1-d51c-0ed7-1532533f34f0'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('c92d5ac2-9638-a851-f88b-5b72bb0cbdb2'::uuid, 'c2ad9578-ccc2-768d-4e7b-eeebea84a669'::uuid, '88888888-8888-8888-8888-888888888881'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('7bcb205d-4c08-1bb9-d297-f1044dbaa102'::uuid, '88f5401c-86a4-e628-a718-7f7f36b84965'::uuid, '88888888-8888-8888-8888-888888888882'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('2158dee4-70f3-44c8-483e-a01dc26318b2'::uuid, '23ffdd84-c9de-9eb4-2802-1bfcda4d6b34'::uuid, '01c51be3-9a3f-09ff-4886-797ca7762595'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('817e825d-ebc1-ef24-fb8e-faaa33d99882'::uuid, '7d8a35cf-8def-cd87-e1d6-89d30de22773'::uuid, 'c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, '33333333-3333-3333-3333-333333333333'::uuid),
  ('53caef73-146a-cad8-3b26-69a319af35a3'::uuid, 'a291d900-2ae0-ab2d-3ed1-1baf961f8b86'::uuid, '521cd85c-106d-d37c-5f52-b5f4caf56269'::uuid, '33333333-3333-3333-3333-333333333333'::uuid)
ON CONFLICT (student_id, academic_year_id) DO UPDATE SET
  lecturer_id = EXCLUDED.lecturer_id;

-- ============================================================
-- COURSE REGISTRATIONS / KRS (15 students, mixed statuses)
-- ============================================================
INSERT INTO course_registrations (id, student_id, academic_year_id, semester_id, status, submitted_at, rejection_reason) VALUES
  ('3a50e6d5-55d7-ca7f-e00c-8e266e7bee62'::uuid, '99999999-9999-9999-9999-999999999991'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'approved'::krs_status, now(), NULL),
  ('fee4e371-c439-d340-fa41-456d41e8a368'::uuid, 'bcdda7c8-0bae-c096-b676-76edad81bacf'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'approved'::krs_status, now(), NULL),
  ('ad06faa8-1601-4588-871f-4228aa267aeb'::uuid, '609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'approved'::krs_status, now(), NULL),
  ('47655539-cb5b-8fc6-57ff-52c49574f989'::uuid, '219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'approved'::krs_status, now(), NULL),
  ('9dcb4d1e-bc88-8b14-4317-0be585e08730'::uuid, '8ba48f37-90fb-acd3-7500-43da5ee3dfd2'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'approved'::krs_status, now(), NULL),
  ('4d133345-6fff-03fd-b280-651d7633bbfb'::uuid, 'd0128f1a-77ab-4d8e-f247-699863292574'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'submitted'::krs_status, now(), NULL),
  ('36ee5fe9-5440-e37a-1b44-3bf23aefcf9a'::uuid, 'd0538330-878a-7e6b-c00c-cb37f47f6a1a'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'submitted'::krs_status, now(), NULL),
  ('e5774c2a-d5a5-f712-f177-22f7fb14ec3a'::uuid, '54fa8324-c892-4293-e731-a166237f2ef3'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'submitted'::krs_status, now(), NULL),
  ('51e90c55-05db-1371-befd-05ed8049546e'::uuid, '94cea4fd-0635-ff9d-6c6b-ef26a03d27b2'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'submitted'::krs_status, now(), NULL),
  ('ce6c7f12-43a3-ea98-4199-34885b4d78fe'::uuid, '981eb403-b97b-0905-4753-b59a0afc2d48'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'draft'::krs_status, NULL, NULL),
  ('3902c679-a1d8-0a9b-86fd-6dea6869a45e'::uuid, 'db8f5cf3-61a6-0fdd-7e7e-565ccfb318c1'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'draft'::krs_status, NULL, NULL),
  ('3316ab95-9629-c2ca-a394-a38ebd816ff5'::uuid, '7434bb00-578f-e0d9-ea13-43c2f74b46ae'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'draft'::krs_status, NULL, NULL),
  ('9071af93-b3c5-f5b8-c737-b0ebe2932148'::uuid, 'c48baa6f-acc2-3e1b-2bca-bbf6cbf12f71'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'rejected'::krs_status, now(), 'SKS prasyarat belum terpenuhi'),
  ('c167f8cf-949c-bc19-9e24-b648076fd7d2'::uuid, '1fd36942-15c1-6f50-4814-c215a7415507'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'rejected'::krs_status, now(), 'SKS prasyarat belum terpenuhi'),
  ('4eeb5739-6c50-f751-e770-03855f0cd115'::uuid, '0eabea25-cd40-6d70-88b5-26068b74ba49'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'approved'::krs_status, now(), NULL)
ON CONFLICT (student_id, academic_year_id, semester_id) DO UPDATE SET
  id               = EXCLUDED.id,
  status           = EXCLUDED.status,
  submitted_at     = EXCLUDED.submitted_at,
  rejection_reason = EXCLUDED.rejection_reason;

-- ============================================================
-- COURSE REGISTRATION ITEMS
-- ============================================================
INSERT INTO course_registration_items (id, course_registration_id, class_id) VALUES
  ('b0a40863-41fe-90d0-825e-4f9b965eb704'::uuid, '3a50e6d5-55d7-ca7f-e00c-8e266e7bee62'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid),
  ('f7919c15-2ef2-b2af-c099-dc8c9f4f071d'::uuid, '3a50e6d5-55d7-ca7f-e00c-8e266e7bee62'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid),
  ('bd8ccc76-4657-83ab-14e6-68b0a130dfb7'::uuid, 'fee4e371-c439-d340-fa41-456d41e8a368'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid),
  ('15256877-f6ee-b908-12e0-16d915d78090'::uuid, 'fee4e371-c439-d340-fa41-456d41e8a368'::uuid, 'ca89b149-f5d8-3346-34f3-0e8c14440dc0'::uuid),
  ('e4c21513-3478-df43-1aca-f04e4bdebf87'::uuid, 'ad06faa8-1601-4588-871f-4228aa267aeb'::uuid, 'ca89b149-f5d8-3346-34f3-0e8c14440dc0'::uuid),
  ('96e5963c-46e5-7caf-d294-427a831a764c'::uuid, 'ad06faa8-1601-4588-871f-4228aa267aeb'::uuid, '10eee011-da15-2fe1-a509-e4fd4c733e64'::uuid),
  ('9dc732a0-9aba-b317-e5b4-6cee1768b998'::uuid, '47655539-cb5b-8fc6-57ff-52c49574f989'::uuid, '10eee011-da15-2fe1-a509-e4fd4c733e64'::uuid),
  ('6553537c-a29b-0737-79bc-84e28f0db21c'::uuid, '47655539-cb5b-8fc6-57ff-52c49574f989'::uuid, '41b19aaf-0f6b-b970-59c1-05fb632468b3'::uuid),
  ('707a83ca-c706-f07e-f8fa-f475950577df'::uuid, '9dcb4d1e-bc88-8b14-4317-0be585e08730'::uuid, '41b19aaf-0f6b-b970-59c1-05fb632468b3'::uuid),
  ('a32e9b5e-e6e5-9839-3259-84a64682c496'::uuid, '9dcb4d1e-bc88-8b14-4317-0be585e08730'::uuid, 'ccf1d2ef-da4e-fba1-fc0b-89d882842357'::uuid),
  ('148cef9b-4da1-98cb-52b8-bca84b20a864'::uuid, '4d133345-6fff-03fd-b280-651d7633bbfb'::uuid, 'ccf1d2ef-da4e-fba1-fc0b-89d882842357'::uuid),
  ('5431544c-9fae-cf61-21bc-ce3287845e39'::uuid, '4d133345-6fff-03fd-b280-651d7633bbfb'::uuid, 'dd3c1109-675c-c8c5-0ecb-685387e6a046'::uuid),
  ('f705337e-1a00-468c-5b99-55433521260f'::uuid, '36ee5fe9-5440-e37a-1b44-3bf23aefcf9a'::uuid, '2528253b-fea1-62e7-00fc-c013d9edacf6'::uuid),
  ('dc052a42-8522-6c31-99ea-6154b5a022d5'::uuid, '36ee5fe9-5440-e37a-1b44-3bf23aefcf9a'::uuid, '659a3a7e-c63c-f013-3830-1f486969c521'::uuid),
  ('f299015f-3721-0bfb-1213-1011bb4d5e0b'::uuid, 'e5774c2a-d5a5-f712-f177-22f7fb14ec3a'::uuid, '659a3a7e-c63c-f013-3830-1f486969c521'::uuid),
  ('68bed740-76e4-f4de-d352-f405cb822c78'::uuid, 'e5774c2a-d5a5-f712-f177-22f7fb14ec3a'::uuid, 'de610dc2-6feb-191a-0567-f157b6ab69fc'::uuid),
  ('8aa944fd-99e0-129e-ba6b-8bca43981614'::uuid, '51e90c55-05db-1371-befd-05ed8049546e'::uuid, 'de610dc2-6feb-191a-0567-f157b6ab69fc'::uuid),
  ('e8c4b3af-af30-fb6b-1dbe-8384ab8184cf'::uuid, '51e90c55-05db-1371-befd-05ed8049546e'::uuid, '2ed96bbd-5f6d-fe3c-2097-44d6b152b62d'::uuid),
  ('fce4b77a-4579-71b6-d893-14a37f05085b'::uuid, 'ce6c7f12-43a3-ea98-4199-34885b4d78fe'::uuid, '2ed96bbd-5f6d-fe3c-2097-44d6b152b62d'::uuid),
  ('522119ef-e250-6342-cdf4-02cc4b2da150'::uuid, 'ce6c7f12-43a3-ea98-4199-34885b4d78fe'::uuid, '2528253b-fea1-62e7-00fc-c013d9edacf6'::uuid),
  ('9faedd57-f1e1-1ccf-0345-a68db9da590f'::uuid, '3902c679-a1d8-0a9b-86fd-6dea6869a45e'::uuid, '7e51dff0-96f9-e5c4-fec8-cb26d18d0944'::uuid),
  ('3619a62f-22bd-ead0-8a0e-2d370cde4bbe'::uuid, '3902c679-a1d8-0a9b-86fd-6dea6869a45e'::uuid, '8edebf58-69d2-a048-b0cc-ae7fb98be56b'::uuid),
  ('9ec32d7b-de54-774c-7622-a032a9ff64f4'::uuid, '3316ab95-9629-c2ca-a394-a38ebd816ff5'::uuid, '8edebf58-69d2-a048-b0cc-ae7fb98be56b'::uuid),
  ('32f3fe62-354e-2b1b-842b-27dfe532a6d5'::uuid, '3316ab95-9629-c2ca-a394-a38ebd816ff5'::uuid, '944a3c5a-4064-82fa-dfd7-364555c3496a'::uuid),
  ('d0779126-a701-8c85-c147-a4c53f264651'::uuid, '9071af93-b3c5-f5b8-c737-b0ebe2932148'::uuid, '2ad95bd2-372c-38ae-c14a-6992624011df'::uuid),
  ('d27b62c9-8bb4-9836-8000-2061ee01a0f6'::uuid, '9071af93-b3c5-f5b8-c737-b0ebe2932148'::uuid, 'b89dada1-9309-e13a-842a-6a638707fa88'::uuid),
  ('bdca6711-ddbd-b23a-2e89-4cd98ac759e8'::uuid, 'c167f8cf-949c-bc19-9e24-b648076fd7d2'::uuid, 'b89dada1-9309-e13a-842a-6a638707fa88'::uuid),
  ('8e8a2357-b790-501d-30b3-be31675454d7'::uuid, 'c167f8cf-949c-bc19-9e24-b648076fd7d2'::uuid, '2ad95bd2-372c-38ae-c14a-6992624011df'::uuid),
  ('c2291762-c6d7-0e2b-929d-1874c22764b4'::uuid, '4eeb5739-6c50-f751-e770-03855f0cd115'::uuid, '34b6930f-b7f6-86e3-5915-d77ff1cd5646'::uuid)
ON CONFLICT (course_registration_id, class_id) DO UPDATE SET
  class_id = EXCLUDED.class_id;

-- ============================================================
-- GRADES (for approved KRS items)
-- ============================================================
INSERT INTO grades (id, student_id, class_id, assignment_score, midterm_score, final_score, final_numeric_score, final_letter_grade, grade_point, is_published, is_locked) VALUES
  ('ee897812-f18c-0478-65cd-9abd87dbe6d9'::uuid, '99999999-9999-9999-9999-999999999991'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01'::uuid, 70, 65, 60, 64, 'C+', 2.3, true, true),
  ('3c0c1483-57f3-1a2b-e9f8-ef3b8f383e8c'::uuid, '99999999-9999-9999-9999-999999999991'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid, 75, 74, 63, 69, 'B-', 2.7, true, true),
  ('64bcacdc-af28-afcc-ec89-8a2f05de07f4'::uuid, 'bcdda7c8-0bae-c096-b676-76edad81bacf'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02'::uuid, 77, 70, 69, 71, 'B', 3, true, false),
  ('b8c2f1db-133b-13f2-8ebd-0b44dd5a3db8'::uuid, 'bcdda7c8-0bae-c096-b676-76edad81bacf'::uuid, 'ca89b149-f5d8-3346-34f3-0e8c14440dc0'::uuid, 82, 79, 72, 76, 'B+', 3.3, true, false),
  ('68338c05-1d39-3bb2-c16d-624a2448d98c'::uuid, '609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, 'ca89b149-f5d8-3346-34f3-0e8c14440dc0'::uuid, 84, 75, 78, 78, 'B+', 3.3, true, false),
  ('df564661-5617-a9c9-aba0-46b236c070e0'::uuid, '609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, '10eee011-da15-2fe1-a509-e4fd4c733e64'::uuid, 89, 84, 81, 84, 'A-', 3.7, true, false),
  ('c3fc21e6-1f24-873e-9746-5535626e8d68'::uuid, '219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, '10eee011-da15-2fe1-a509-e4fd4c733e64'::uuid, 91, 80, 87, 86, 'A', 4, true, false),
  ('c7a95cef-5568-6ca7-c595-3f89c1e86d25'::uuid, '219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, '41b19aaf-0f6b-b970-59c1-05fb632468b3'::uuid, 71, 89, 90, 86, 'A', 4, true, false),
  ('fa706ba5-1c1f-d531-1b7a-7a0210f546e6'::uuid, '8ba48f37-90fb-acd3-7500-43da5ee3dfd2'::uuid, '41b19aaf-0f6b-b970-59c1-05fb632468b3'::uuid, 73, 85, 61, 71, 'B', 3, true, false),
  ('3452bf3d-496d-d7a7-dcb4-351626a05b06'::uuid, '8ba48f37-90fb-acd3-7500-43da5ee3dfd2'::uuid, 'ccf1d2ef-da4e-fba1-fc0b-89d882842357'::uuid, 78, 94, 64, 76, 'B+', 3.3, true, false),
  ('0c4cd62f-4acb-e6d4-38a3-ff8ff6ee5dfb'::uuid, '0eabea25-cd40-6d70-88b5-26068b74ba49'::uuid, '34b6930f-b7f6-86e3-5915-d77ff1cd5646'::uuid, 93, 75, 81, 82, 'A-', 3.7, true, false)
ON CONFLICT (student_id, class_id) DO UPDATE SET
  assignment_score     = EXCLUDED.assignment_score,
  midterm_score        = EXCLUDED.midterm_score,
  final_score          = EXCLUDED.final_score,
  final_numeric_score  = EXCLUDED.final_numeric_score,
  final_letter_grade   = EXCLUDED.final_letter_grade,
  grade_point          = EXCLUDED.grade_point,
  is_published         = EXCLUDED.is_published,
  is_locked            = EXCLUDED.is_locked;

-- ============================================================
-- ACADEMIC PROGRAM PERIODS: KKN/TA/KP (6)
-- ============================================================
INSERT INTO academic_program_periods (id, program_type, academic_year_id, semester_id, name, registration_start, registration_end, min_credits, min_gpa, supervisor_quota_default, is_active) VALUES
  ('b47ee824-5e2c-27a2-4755-7cc7ea85a582'::uuid, 'kkn'::academic_program_type, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'KKN Ganjil 2025/2026', '2025-08-01'::date, '2025-08-31'::date, 100, 2.75, 8, true),
  ('c1698a4f-693b-c16f-f7b4-0679abdaed67'::uuid, 'kkn'::academic_program_type, '1e9656fc-5d90-e4f0-d6d9-a0bc55780416'::uuid, '2f7650b9-57a7-c061-b8f4-eba98d2ec17c'::uuid, 'KKN Genap 2024/2025', '2025-01-01'::date, '2025-01-31'::date, 100, 2.75, 8, false),
  ('521f0c61-42ca-cad2-66d3-552b5fe3b85e'::uuid, 'ta'::academic_program_type, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'TA Ganjil 2025/2026', '2025-08-01'::date, '2025-08-31'::date, 100, 2.75, 8, true),
  ('5bed276b-f2d8-40d8-2964-2a6499e0333a'::uuid, 'ta'::academic_program_type, '1e9656fc-5d90-e4f0-d6d9-a0bc55780416'::uuid, '2f7650b9-57a7-c061-b8f4-eba98d2ec17c'::uuid, 'TA Genap 2024/2025', '2025-01-01'::date, '2025-01-31'::date, 100, 2.75, 8, false),
  ('c848db00-77a2-bae0-dec5-9c7228af426b'::uuid, 'kp'::academic_program_type, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'KP Ganjil 2025/2026', '2025-08-01'::date, '2025-08-31'::date, 100, 2.75, 8, true),
  ('37e52a37-931c-7436-2290-f792301c4521'::uuid, 'kp'::academic_program_type, '1e9656fc-5d90-e4f0-d6d9-a0bc55780416'::uuid, '2f7650b9-57a7-c061-b8f4-eba98d2ec17c'::uuid, 'KP Genap 2024/2025', '2025-01-01'::date, '2025-01-31'::date, 100, 2.75, 8, false)
ON CONFLICT (id) DO UPDATE SET
  registration_start = EXCLUDED.registration_start,
  registration_end   = EXCLUDED.registration_end,
  is_active          = EXCLUDED.is_active;

-- ============================================================
-- ACADEMIC PROGRAM RUBRICS (12, 2 per period)
-- ============================================================
INSERT INTO academic_program_rubrics (id, period_id, component, assessor_role, max_score, weight_percent, display_order) VALUES
  ('e4de4c9b-ef8b-cb22-7b35-778c9bae8634'::uuid, 'b47ee824-5e2c-27a2-4755-7cc7ea85a582'::uuid, 'Bimbingan dan Sikap', 'supervisor'::academic_program_assignment_role, 100, 50, 1),
  ('9fb5ce79-843f-6a4d-0b53-1035a25b5d32'::uuid, 'b47ee824-5e2c-27a2-4755-7cc7ea85a582'::uuid, 'Laporan Akhir dan Presentasi', 'examiner'::academic_program_assignment_role, 100, 50, 2),
  ('aee92e67-190f-4bfd-5b7f-3a5d5437e5cc'::uuid, 'c1698a4f-693b-c16f-f7b4-0679abdaed67'::uuid, 'Bimbingan dan Sikap', 'supervisor'::academic_program_assignment_role, 100, 50, 1),
  ('6e902cea-090c-7b5c-ca49-1a38fe5c0cf7'::uuid, 'c1698a4f-693b-c16f-f7b4-0679abdaed67'::uuid, 'Laporan Akhir dan Presentasi', 'examiner'::academic_program_assignment_role, 100, 50, 2),
  ('48a35c52-6cba-05be-81e0-a378e3f6b802'::uuid, '521f0c61-42ca-cad2-66d3-552b5fe3b85e'::uuid, 'Bimbingan dan Sikap', 'supervisor'::academic_program_assignment_role, 100, 50, 1),
  ('72390d84-537c-c5d6-a95b-18d4bb713993'::uuid, '521f0c61-42ca-cad2-66d3-552b5fe3b85e'::uuid, 'Laporan Akhir dan Presentasi', 'examiner'::academic_program_assignment_role, 100, 50, 2),
  ('c1eb1f56-da40-029e-acf4-12f7f4277485'::uuid, '5bed276b-f2d8-40d8-2964-2a6499e0333a'::uuid, 'Bimbingan dan Sikap', 'supervisor'::academic_program_assignment_role, 100, 50, 1),
  ('98d01dd7-f87e-2d25-1dde-97151f9bb529'::uuid, '5bed276b-f2d8-40d8-2964-2a6499e0333a'::uuid, 'Laporan Akhir dan Presentasi', 'examiner'::academic_program_assignment_role, 100, 50, 2),
  ('64775a93-0a31-6090-d325-db8e0ad2b67e'::uuid, 'c848db00-77a2-bae0-dec5-9c7228af426b'::uuid, 'Bimbingan dan Sikap', 'supervisor'::academic_program_assignment_role, 100, 50, 1),
  ('1f62d2dd-13a1-4990-02f4-5928537abf3f'::uuid, 'c848db00-77a2-bae0-dec5-9c7228af426b'::uuid, 'Laporan Akhir dan Presentasi', 'examiner'::academic_program_assignment_role, 100, 50, 2),
  ('39c7632e-b9cb-574c-2a7f-44534fb6d905'::uuid, '37e52a37-931c-7436-2290-f792301c4521'::uuid, 'Bimbingan dan Sikap', 'supervisor'::academic_program_assignment_role, 100, 50, 1),
  ('91ede287-283a-b722-fecf-a6b06073cbab'::uuid, '37e52a37-931c-7436-2290-f792301c4521'::uuid, 'Laporan Akhir dan Presentasi', 'examiner'::academic_program_assignment_role, 100, 50, 2)
ON CONFLICT (id) DO UPDATE SET
  component      = EXCLUDED.component,
  weight_percent = EXCLUDED.weight_percent;

-- ============================================================
-- ACADEMIC PROGRAM REGISTRATIONS (12, 2 per period)
-- ============================================================
INSERT INTO academic_program_registrations (id, period_id, student_id, proposal_title, status, prerequisite_credits, prerequisite_gpa, prerequisite_passed, rejection_reason, final_score, final_letter_grade, grade_point) VALUES
  ('48f8ab2f-346a-2c63-1b8d-cec141009869'::uuid, 'b47ee824-5e2c-27a2-4755-7cc7ea85a582'::uuid, '99999999-9999-9999-9999-999999999991'::uuid, 'KKN — Ahmad Fauzi', 'pending'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL),
  ('1c18f398-cf2b-099c-f40b-1abe288b314d'::uuid, 'b47ee824-5e2c-27a2-4755-7cc7ea85a582'::uuid, 'bcdda7c8-0bae-c096-b676-76edad81bacf'::uuid, 'KKN — Bunga Citra Dewi', 'approved'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL),
  ('66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e'::uuid, 'c1698a4f-693b-c16f-f7b4-0679abdaed67'::uuid, '609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, 'KKN — Chandra Wijaya', 'active'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL),
  ('5cf7d641-66d9-08db-a00a-e5cc9c916fc2'::uuid, 'c1698a4f-693b-c16f-f7b4-0679abdaed67'::uuid, '219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, 'KKN — Dian Puspita', 'completed'::academic_program_registration_status, 100, 3.00, true, NULL, 88, 'A-', 3.7),
  ('eb1a6f5e-87ba-b1f8-30fa-875b0547814a'::uuid, '521f0c61-42ca-cad2-66d3-552b5fe3b85e'::uuid, '8ba48f37-90fb-acd3-7500-43da5ee3dfd2'::uuid, 'Tugas Akhir — Eko Prasetyo', 'rejected'::academic_program_registration_status, 100, 3.00, true, 'Prasyarat SKS belum terpenuhi', NULL, NULL, NULL),
  ('1ce84193-42b5-7eff-76fe-5428c329aa23'::uuid, '521f0c61-42ca-cad2-66d3-552b5fe3b85e'::uuid, 'd0128f1a-77ab-4d8e-f247-699863292574'::uuid, 'Tugas Akhir — Fitri Handayani', 'active'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL),
  ('798390cb-f72d-380e-86f7-49d5a64677e8'::uuid, '5bed276b-f2d8-40d8-2964-2a6499e0333a'::uuid, 'd0538330-878a-7e6b-c00c-cb37f47f6a1a'::uuid, 'Tugas Akhir — Gilang Ramadhan', 'pending'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL),
  ('f1e5e28e-2b63-8990-8209-11b1711df48a'::uuid, '5bed276b-f2d8-40d8-2964-2a6499e0333a'::uuid, '54fa8324-c892-4293-e731-a166237f2ef3'::uuid, 'Tugas Akhir — Hesti Nuraini', 'approved'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL),
  ('ff90abda-b7f0-e40e-8b39-310db403949a'::uuid, 'c848db00-77a2-bae0-dec5-9c7228af426b'::uuid, '94cea4fd-0635-ff9d-6c6b-ef26a03d27b2'::uuid, 'Kerja Praktek — Indra Kusuma', 'active'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL),
  ('cb3fd82f-0fd4-f077-27ba-b09f18632826'::uuid, 'c848db00-77a2-bae0-dec5-9c7228af426b'::uuid, '981eb403-b97b-0905-4753-b59a0afc2d48'::uuid, 'Kerja Praktek — Jasmine Putri', 'completed'::academic_program_registration_status, 100, 3.00, true, NULL, 88, 'A-', 3.7),
  ('a8c91b4b-009d-1490-fdb9-87a420fe3278'::uuid, '37e52a37-931c-7436-2290-f792301c4521'::uuid, 'db8f5cf3-61a6-0fdd-7e7e-565ccfb318c1'::uuid, 'Kerja Praktek — Kevin Saputra', 'rejected'::academic_program_registration_status, 100, 3.00, true, 'Prasyarat SKS belum terpenuhi', NULL, NULL, NULL),
  ('7fb20dca-1195-048e-d73a-d61ed7ec4f26'::uuid, '37e52a37-931c-7436-2290-f792301c4521'::uuid, '7434bb00-578f-e0d9-ea13-43c2f74b46ae'::uuid, 'Kerja Praktek — Lestari Wulandari', 'active'::academic_program_registration_status, 100, 3.00, true, NULL, NULL, NULL, NULL)
ON CONFLICT (period_id, student_id) DO UPDATE SET
  id          = EXCLUDED.id,
  status      = EXCLUDED.status,
  final_score = EXCLUDED.final_score;

-- ============================================================
-- ACADEMIC PROGRAM ASSIGNMENTS (dosen pembimbing)
-- ============================================================
INSERT INTO academic_program_assignments (id, registration_id, lecturer_id, assignment_role) VALUES
  ('b1048172-b16b-4dfe-7dc4-fe51f6b7ca39'::uuid, '1c18f398-cf2b-099c-f40b-1abe288b314d'::uuid, '88888888-8888-8888-8888-888888888882'::uuid, 'supervisor'::academic_program_assignment_role),
  ('3b1cba23-7a90-c9ef-f1a6-4587350d054d'::uuid, '66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e'::uuid, '01c51be3-9a3f-09ff-4886-797ca7762595'::uuid, 'supervisor'::academic_program_assignment_role),
  ('fc61d77d-450d-5789-1fb7-a7b9640a85ad'::uuid, '5cf7d641-66d9-08db-a00a-e5cc9c916fc2'::uuid, 'c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, 'supervisor'::academic_program_assignment_role),
  ('f7adc6eb-3c65-1745-e019-132d0b87b0ba'::uuid, '1ce84193-42b5-7eff-76fe-5428c329aa23'::uuid, 'a7ab8d4a-7ecc-d79b-64bb-ca26880c3e5d'::uuid, 'supervisor'::academic_program_assignment_role),
  ('5dba8803-3fbe-5f57-b76a-4cdf0166eca5'::uuid, 'f1e5e28e-2b63-8990-8209-11b1711df48a'::uuid, '494e4588-29ea-32d0-260b-8ec98f0a46a7'::uuid, 'supervisor'::academic_program_assignment_role),
  ('e892114b-521a-4b2f-5d8f-a1754fc89c9b'::uuid, 'ff90abda-b7f0-e40e-8b39-310db403949a'::uuid, 'ff993071-5804-8065-ad3b-8aafedc6008c'::uuid, 'supervisor'::academic_program_assignment_role),
  ('ff09c66f-884a-9618-177a-98c98218ebe6'::uuid, 'cb3fd82f-0fd4-f077-27ba-b09f18632826'::uuid, '2ae198bb-99fc-9eea-a264-efc138f26a2c'::uuid, 'supervisor'::academic_program_assignment_role),
  ('1a1dc357-3314-9fae-ec53-6a9493a7483d'::uuid, '7fb20dca-1195-048e-d73a-d61ed7ec4f26'::uuid, '079a8856-e7ea-1d72-a6c1-ee4caccdc4a2'::uuid, 'supervisor'::academic_program_assignment_role)
ON CONFLICT (registration_id, lecturer_id, assignment_role) DO UPDATE SET
  assignment_role = EXCLUDED.assignment_role;

-- ============================================================
-- ACADEMIC PROGRAM LOGBOOKS
-- ============================================================
INSERT INTO academic_program_logbooks (id, registration_id, student_id, entry_date, week_number, activity, status) VALUES
  ('2447a6a3-7155-473e-4ff1-79a4f1e6cf81'::uuid, '66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e'::uuid, '609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, '2025-08-05'::date, 1, 'Survei lokasi dan koordinasi awal', 'accepted'::academic_program_logbook_status),
  ('47760ffb-ce5c-785d-6729-eef897aa9511'::uuid, '66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e'::uuid, '609e30ff-f4b5-17a7-4525-66867b7bd8cc'::uuid, '2025-08-10'::date, 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'::academic_program_logbook_status),
  ('b47a4ef9-f2e9-b9f9-02ff-008e0890d96c'::uuid, '5cf7d641-66d9-08db-a00a-e5cc9c916fc2'::uuid, '219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, '2025-08-05'::date, 1, 'Survei lokasi dan koordinasi awal', 'accepted'::academic_program_logbook_status),
  ('5a735cb8-783b-6835-b829-6d6c9c6c1651'::uuid, '5cf7d641-66d9-08db-a00a-e5cc9c916fc2'::uuid, '219818be-2fa6-c6a5-ff6b-4da87a4a880d'::uuid, '2025-08-10'::date, 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'::academic_program_logbook_status),
  ('7f845980-5369-4515-b121-728c7448e2e4'::uuid, '1ce84193-42b5-7eff-76fe-5428c329aa23'::uuid, 'd0128f1a-77ab-4d8e-f247-699863292574'::uuid, '2025-08-05'::date, 1, 'Survei lokasi dan koordinasi awal', 'accepted'::academic_program_logbook_status),
  ('d199f093-437b-1f4a-62fa-3569e0535693'::uuid, '1ce84193-42b5-7eff-76fe-5428c329aa23'::uuid, 'd0128f1a-77ab-4d8e-f247-699863292574'::uuid, '2025-08-10'::date, 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'::academic_program_logbook_status),
  ('76b6c219-9959-10c4-eb44-f4ae767fcd1b'::uuid, 'ff90abda-b7f0-e40e-8b39-310db403949a'::uuid, '94cea4fd-0635-ff9d-6c6b-ef26a03d27b2'::uuid, '2025-08-05'::date, 1, 'Survei lokasi dan koordinasi awal', 'accepted'::academic_program_logbook_status),
  ('129940ac-5ceb-42f1-9f77-d786589298d9'::uuid, 'ff90abda-b7f0-e40e-8b39-310db403949a'::uuid, '94cea4fd-0635-ff9d-6c6b-ef26a03d27b2'::uuid, '2025-08-10'::date, 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'::academic_program_logbook_status),
  ('2cf7b2f9-ea93-0be1-cbba-be66ba28f637'::uuid, 'cb3fd82f-0fd4-f077-27ba-b09f18632826'::uuid, '981eb403-b97b-0905-4753-b59a0afc2d48'::uuid, '2025-08-05'::date, 1, 'Survei lokasi dan koordinasi awal', 'accepted'::academic_program_logbook_status),
  ('881a14a5-b3f3-cb4b-97ea-048dd0557803'::uuid, 'cb3fd82f-0fd4-f077-27ba-b09f18632826'::uuid, '981eb403-b97b-0905-4753-b59a0afc2d48'::uuid, '2025-08-10'::date, 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'::academic_program_logbook_status),
  ('90e9d4c5-f241-6060-06ee-e721383e02d6'::uuid, '7fb20dca-1195-048e-d73a-d61ed7ec4f26'::uuid, '7434bb00-578f-e0d9-ea13-43c2f74b46ae'::uuid, '2025-08-05'::date, 1, 'Survei lokasi dan koordinasi awal', 'accepted'::academic_program_logbook_status),
  ('e1177975-7467-2620-bff3-737aa066f999'::uuid, '7fb20dca-1195-048e-d73a-d61ed7ec4f26'::uuid, '7434bb00-578f-e0d9-ea13-43c2f74b46ae'::uuid, '2025-08-10'::date, 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'::academic_program_logbook_status)
ON CONFLICT (id) DO UPDATE SET
  activity = EXCLUDED.activity,
  status   = EXCLUDED.status;

-- ============================================================
-- ACADEMIC PROGRAM ASSESSMENTS
-- ============================================================
INSERT INTO academic_program_assessments (id, registration_id, rubric_id, assessor_id, score) VALUES
  ('2a3887b2-d77b-532a-9ca6-1094fa162a1b'::uuid, '5cf7d641-66d9-08db-a00a-e5cc9c916fc2'::uuid, 'aee92e67-190f-4bfd-5b7f-3a5d5437e5cc'::uuid, 'c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, 88),
  ('e416a3cf-ee87-ecb2-1616-eaa18e9dcb3a'::uuid, '5cf7d641-66d9-08db-a00a-e5cc9c916fc2'::uuid, '6e902cea-090c-7b5c-ca49-1a38fe5c0cf7'::uuid, 'c28173b4-eef2-0b25-c61c-e6b4496263dd'::uuid, 88),
  ('8bab8bc9-f04d-2c0c-d97a-cbd2add17b5f'::uuid, 'cb3fd82f-0fd4-f077-27ba-b09f18632826'::uuid, '64775a93-0a31-6090-d325-db8e0ad2b67e'::uuid, '2ae198bb-99fc-9eea-a264-efc138f26a2c'::uuid, 88),
  ('eb3e9bfe-debc-6f4f-573a-394743ebca5c'::uuid, 'cb3fd82f-0fd4-f077-27ba-b09f18632826'::uuid, '1f62d2dd-13a1-4990-02f4-5928537abf3f'::uuid, '2ae198bb-99fc-9eea-a264-efc138f26a2c'::uuid, 88)
ON CONFLICT (registration_id, rubric_id, assessor_id) DO UPDATE SET
  score = EXCLUDED.score;
