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
  ('5cee93e8-2758-154b-aa55-4c68eac28c78'::uuid, 'FTI', 'Fakultas Teknologi Informasi'),
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
  name = EXCLUDED.name;

-- ============================================================
-- STUDY PROGRAMS (15)
-- ============================================================
INSERT INTO study_programs (id, faculty_id, code, name, degree_level)
SELECT v.id::uuid, f.id, v.code, v.name, v.degree_level
FROM (VALUES
  ('d83a6a43-2677-1d1f-4335-b0a436ddacd1', 'FTI', 'TI', 'Teknik Informatika', 'S1'),
  ('d110579a-fa63-6882-51aa-aa9e8168ad60', 'FTI', 'SI', 'Sistem Informasi', 'S1'),
  ('f2505d81-a578-62cb-8c63-1b4a9dec65ea', 'FEB', 'MJ', 'Manajemen', 'S1'),
  ('2424d4d3-6b03-6395-5fa2-32c93e915b1d', 'FEB', 'AK', 'Akuntansi', 'S1'),
  ('f3bbbc19-6235-74e9-882e-596b45d9810f', 'FH', 'IH', 'Ilmu Hukum', 'S1'),
  ('36219360-5619-5b61-ec55-cb7c320889df', 'FK', 'PD', 'Pendidikan Dokter', 'S1'),
  ('b7cd2f12-8a43-ffea-f874-19fd6ae94c4f', 'FISIP', 'HI', 'Hubungan Internasional', 'S1'),
  ('40b6885a-441a-2af0-c978-cb55252f8dbe', 'FISIP', 'IKOM', 'Ilmu Komunikasi', 'S1'),
  ('029525d9-d84d-3613-cf95-f00eff6ac879', 'FT', 'TS', 'Teknik Sipil', 'S1'),
  ('17f297a9-af58-139f-922e-2b7cb7ff6ab9', 'FT', 'TE', 'Teknik Elektro', 'S1'),
  ('b68d3fce-07b8-ed83-5c6e-b673c1ccb6f2', 'FMIPA', 'MAT', 'Matematika', 'S1'),
  ('d9fbac45-97b8-14a4-b1cd-c45a0c6558d2', 'FMIPA', 'FIS', 'Fisika', 'S1'),
  ('88a41bd5-b6c5-2db7-5f51-bebe08f1c2c4', 'FIB', 'SAS', 'Sastra Inggris', 'S1'),
  ('464025f4-f01a-5df6-3996-305249d20f59', 'FPSI', 'PSI', 'Psikologi', 'S1'),
  ('dd78b7a8-c350-c048-b251-5159ab71b41c', 'FKIP', 'PGSD', 'Pendidikan Guru SD', 'S1')
) AS v(id, faculty_code, code, name, degree_level)
JOIN faculties f ON f.code = v.faculty_code
ON CONFLICT (code) DO UPDATE SET
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
  ('48b350a2-128a-efa2-7144-a407b44009ae'::uuid, '2025/2026', true)
ON CONFLICT (year_label) DO UPDATE SET
  is_active = EXCLUDED.is_active;

-- ============================================================
-- SEMESTERS (12)
-- ============================================================
INSERT INTO semesters (id, academic_year_id, name, semester_number, is_active)
SELECT v.id::uuid, y.id, v.name, v.semester_number, v.is_active
FROM (VALUES
  ('531ff9b2-3c80-5a97-8865-18fe4bbaad0b', '2020/2021', 'Ganjil 2020/2021', 1, false),
  ('f264da83-203f-2c89-3647-43ff19891d5c', '2020/2021', 'Genap 2020/2021', 2, false),
  ('5c2dd2c3-28c4-38fe-36de-9d43b20f53f1', '2021/2022', 'Ganjil 2021/2022', 1, false),
  ('bf9d9534-a52b-4dfd-4826-b88bd9e05be8', '2021/2022', 'Genap 2021/2022', 2, false),
  ('22bad03e-2766-c495-9369-99da2831ab7b', '2022/2023', 'Ganjil 2022/2023', 1, false),
  ('cb2db0f8-59f6-0dcd-610f-ccbb81c533a4', '2022/2023', 'Genap 2022/2023', 2, false),
  ('7ed759d1-2870-0579-5e8b-bad0e862e144', '2023/2024', 'Ganjil 2023/2024', 1, false),
  ('2e0cfd9b-b8b6-1e57-db9f-8f8bc4bc7f0f', '2023/2024', 'Genap 2023/2024', 2, false),
  ('ca7f5efd-072c-c8f4-34b8-070b7bb44437', '2024/2025', 'Ganjil 2024/2025', 1, false),
  ('2f7650b9-57a7-c061-b8f4-eba98d2ec17c', '2024/2025', 'Genap 2024/2025', 2, false),
  ('f5cf43d3-aa67-7949-144e-14042cd6a021', '2025/2026', 'Ganjil 2025/2026', 1, true),
  ('4b7a70e3-efe3-0f97-7277-cfac0fe683fa', '2025/2026', 'Genap 2025/2026', 2, false)
) AS v(id, year_label, name, semester_number, is_active)
JOIN academic_years y ON y.year_label = v.year_label
ON CONFLICT (academic_year_id, semester_number) DO UPDATE SET
  name      = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- ============================================================
-- CURRICULUMS (15, one per study program)
-- ============================================================
INSERT INTO curriculums (id, study_program_id, name, year, is_active)
SELECT v.id::uuid, sp.id, v.name, v.year, true
FROM (VALUES
  ('790031b5-fbfa-c392-78ba-5ed304054213', 'TI', 'Kurikulum 2024', 2024),
  ('f7edda0a-06d6-2d94-5fe0-e9f5cca5897c', 'SI', 'Kurikulum 2024', 2024),
  ('af990f4a-877f-947f-26f9-fc6b6752c1bf', 'MJ', 'Kurikulum 2024', 2024),
  ('adf65814-2c13-c4f1-39f3-5761ced72cbe', 'AK', 'Kurikulum 2024', 2024),
  ('6f88b021-77cf-f39d-a742-7dc10fd89c47', 'IH', 'Kurikulum 2024', 2024),
  ('792c551c-793d-df26-4412-fe92f6f86504', 'PD', 'Kurikulum 2024', 2024),
  ('20e4ccb2-382f-ee58-201c-4f7b96e37f97', 'HI', 'Kurikulum 2024', 2024),
  ('97e236e3-df69-798d-9082-4e4a6b9da521', 'IKOM', 'Kurikulum 2024', 2024),
  ('83f4a088-7b5f-369c-b13f-34ac7b5a09bf', 'TS', 'Kurikulum 2024', 2024),
  ('444faca8-1eb4-475a-443d-6a5d8340a7f8', 'TE', 'Kurikulum 2024', 2024),
  ('9b690351-5883-c7ac-1893-934d2598309b', 'MAT', 'Kurikulum 2024', 2024),
  ('f7bbedf1-17ea-70b2-ff9b-45f86d687ac1', 'FIS', 'Kurikulum 2024', 2024),
  ('57abf3e7-ae3f-842d-6e54-c2e37bda60a1', 'SAS', 'Kurikulum 2024', 2024),
  ('a1e750b1-c0b3-383c-290f-cd679da2bcf5', 'PSI', 'Kurikulum 2024', 2024),
  ('a2663149-a41d-fbbd-478b-40a85af83dbe', 'PGSD', 'Kurikulum 2024', 2024)
) AS v(id, study_program_code, name, year)
JOIN study_programs sp ON sp.code = v.study_program_code
ON CONFLICT (id) DO UPDATE SET
  study_program_id = EXCLUDED.study_program_id,
  name             = EXCLUDED.name,
  year             = EXCLUDED.year;

-- ============================================================
-- ROOMS (15)
-- ============================================================
INSERT INTO rooms (id, code, name, capacity, building) VALUES
  ('b595ffb0-7cd1-0445-1908-5f723ca21ead'::uuid, 'A101', 'Ruang A101', 40, 'Gedung A'),
  ('d324f68f-b4c3-ac2e-8347-32979aaf7628'::uuid, 'B201', 'Lab Komputer B201', 30, 'Gedung B'),
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
  name     = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  building = EXCLUDED.building;

-- ============================================================
-- COURSES (20, curriculum_id left unset)
-- ============================================================
INSERT INTO courses (id, course_code, course_name, credits, semester_recommended, study_program_id)
SELECT v.id::uuid, v.course_code, v.course_name, v.credits, v.semester_recommended, sp.id
FROM (VALUES
  ('243c6a99-b639-1e5c-88e2-cb8bf6824ecd', 'TI101', 'Algoritma dan Pemrograman', 3, 1, 'TI'),
  ('67045151-509e-e428-ca92-f7ad30220593', 'TI102', 'Struktur Data', 3, 2, 'TI'),
  ('83c4bc87-c538-14bb-e072-9c835520a7ad', 'TI201', 'Basis Data', 3, 3, 'TI'),
  ('1cdc0999-6051-d246-2e48-8ad29623cdde', 'TI202', 'Pemrograman Web', 3, 4, 'TI'),
  ('5f67991b-86e6-5ae2-c871-dbd777c45824', 'TI203', 'Jaringan Komputer', 3, 4, 'TI'),
  ('cb0a3436-eefb-0791-9919-16ae2deec950', 'TI204', 'Sistem Operasi', 3, 3, 'TI'),
  ('31dc115a-1be8-a554-8897-ea0cc6e5f497', 'TI301', 'Kecerdasan Buatan', 3, 5, 'TI'),
  ('3c4b2ba0-5ff7-49ea-f27f-e6d604ab8c63', 'TI302', 'Rekayasa Perangkat Lunak', 3, 5, 'TI'),
  ('2459f672-c4a6-c155-19c0-3e6c16e4e300', 'TI303', 'Keamanan Siber', 3, 6, 'TI'),
  ('11d7ca96-e366-f155-7ee1-815d2a6f027e', 'TI304', 'Pemrograman Mobile', 3, 6, 'TI'),
  ('3256aa87-02c0-b14e-1d0d-2be5ef152c44', 'SI101', 'Pengantar Sistem Informasi', 3, 1, 'SI'),
  ('058cdea3-4c63-9e07-066f-f355a06ba835', 'SI201', 'Analisis dan Perancangan Sistem', 3, 3, 'SI'),
  ('2dce8a0c-9287-2ebc-6c7e-3446cff9f304', 'SI202', 'Manajemen Proyek TI', 3, 4, 'SI'),
  ('7b96c9fa-f908-fa0e-370a-43221772cd27', 'SI301', 'Enterprise Resource Planning', 3, 5, 'SI'),
  ('1d3b1532-dad7-9153-ca16-e2c0dce371ad', 'MJ101', 'Pengantar Manajemen', 3, 1, 'MJ'),
  ('f8992234-d2c8-7a5b-970f-12a28131c8a4', 'MJ201', 'Manajemen Pemasaran', 3, 3, 'MJ'),
  ('7aaf23b6-fffd-8ef3-67fe-aadd00da84f1', 'MJ202', 'Manajemen Keuangan', 3, 4, 'MJ'),
  ('b4ef855f-cbb4-1d09-a07d-b7d9dfbcb4f1', 'AK101', 'Pengantar Akuntansi', 3, 1, 'AK'),
  ('899a00ac-8da5-7bf2-343d-56d59b13e3e7', 'AK201', 'Akuntansi Keuangan Menengah', 3, 3, 'AK'),
  ('8f64667e-2510-f295-9ffd-e06f8ae53cb1', 'IH101', 'Pengantar Ilmu Hukum', 3, 1, 'IH')
) AS v(id, course_code, course_name, credits, semester_recommended, study_program_code)
JOIN study_programs sp ON sp.code = v.study_program_code
ON CONFLICT (course_code) DO UPDATE SET
  course_name          = EXCLUDED.course_name,
  credits              = EXCLUDED.credits,
  semester_recommended = EXCLUDED.semester_recommended,
  study_program_id     = EXCLUDED.study_program_id;

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
  full_name = EXCLUDED.full_name;

-- ============================================================
-- LECTURERS (15, resolved by user email + study program code)
-- ============================================================
INSERT INTO lecturers (id, profile_id, lecturer_number, study_program_id, expertise)
SELECT v.id::uuid, u.id, v.lecturer_number, sp.id, v.expertise
FROM (VALUES
  ('e79fe349-6b4a-6848-9c1f-2ee9aa9c088e', 'kaprodi@siakad.demo', '01010001', 'TI', 'Rekayasa Perangkat Lunak'),
  ('c2700453-82cc-e0d9-2bc4-64c7891639d4', 'dosen@siakad.demo', '01010002', 'TI', 'Sistem Basis Data'),
  ('01c51be3-9a3f-09ff-4886-797ca7762595', 'dosen3@siakad.demo', '01010003', 'TI', 'Jaringan Komputer'),
  ('c28173b4-eef2-0b25-c61c-e6b4496263dd', 'dosen4@siakad.demo', '01010004', 'TI', 'Kecerdasan Buatan'),
  ('521cd85c-106d-d37c-5f52-b5f4caf56269', 'dosen5@siakad.demo', '01010005', 'SI', 'Manajemen Proyek TI'),
  ('a7ab8d4a-7ecc-d79b-64bb-ca26880c3e5d', 'dosen6@siakad.demo', '01010006', 'SI', 'Keamanan Siber'),
  ('94fe58fb-ede0-e4a5-de25-f37d12c88851', 'dosen7@siakad.demo', '01010007', 'MJ', 'Sistem Informasi'),
  ('494e4588-29ea-32d0-260b-8ec98f0a46a7', 'dosen8@siakad.demo', '01010008', 'MJ', 'Manajemen Pemasaran'),
  ('ff993071-5804-8065-ad3b-8aafedc6008c', 'dosen9@siakad.demo', '01010009', 'AK', 'Akuntansi Keuangan'),
  ('2ae198bb-99fc-9eea-a264-efc138f26a2c', 'dosen10@siakad.demo', '01010010', 'IH', 'Hukum Perdata'),
  ('1e536ef1-72fc-6486-98ed-b867b744fdb6', 'dosen11@siakad.demo', '01010011', 'MAT', 'Matematika Terapan'),
  ('079a8856-e7ea-1d72-a6c1-ee4caccdc4a2', 'dosen12@siakad.demo', '01010012', 'FIS', 'Fisika Terapan'),
  ('24215308-57b4-9cbc-1459-6c189030ec41', 'dosen13@siakad.demo', '01010013', 'IKOM', 'Ilmu Komunikasi'),
  ('11f94c8e-9bc2-878d-982f-17484f7da07b', 'dosen14@siakad.demo', '01010014', 'PSI', 'Psikologi Pendidikan'),
  ('e6f2418a-aca1-d51c-0ed7-1532533f34f0', 'dosen15@siakad.demo', '01010015', 'TS', 'Teknik Sipil')
) AS v(id, email, lecturer_number, study_program_code, expertise)
JOIN users u ON u.email = v.email
JOIN study_programs sp ON sp.code = v.study_program_code
ON CONFLICT (lecturer_number) DO UPDATE SET
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
  full_name = EXCLUDED.full_name;

-- ============================================================
-- STUDENTS (20, resolved by user email + study program code)
-- ============================================================
INSERT INTO students (id, profile_id, student_number, study_program_id, entry_year, academic_status, current_semester)
SELECT v.id::uuid, u.id, v.student_number, sp.id, v.entry_year, v.academic_status::academic_status, v.current_semester
FROM (VALUES
  ('de86943e-1150-7895-7a61-58cb245e5a7e', 'mahasiswa@siakad.demo', '24010001', 'TI', 2024, 'active', 3),
  ('bcdda7c8-0bae-c096-b676-76edad81bacf', 'mahasiswa2@siakad.demo', '24010002', 'TI', 2024, 'active', 3),
  ('609e30ff-f4b5-17a7-4525-66867b7bd8cc', 'mahasiswa3@siakad.demo', '23010003', 'TI', 2023, 'active', 5),
  ('219818be-2fa6-c6a5-ff6b-4da87a4a880d', 'mahasiswa4@siakad.demo', '23010004', 'TI', 2023, 'active', 5),
  ('8ba48f37-90fb-acd3-7500-43da5ee3dfd2', 'mahasiswa5@siakad.demo', '22010005', 'TI', 2022, 'active', 7),
  ('d0128f1a-77ab-4d8e-f247-699863292574', 'mahasiswa6@siakad.demo', '22010006', 'TI', 2022, 'active', 7),
  ('d0538330-878a-7e6b-c00c-cb37f47f6a1a', 'mahasiswa7@siakad.demo', '24020007', 'SI', 2024, 'active', 3),
  ('54fa8324-c892-4293-e731-a166237f2ef3', 'mahasiswa8@siakad.demo', '23020008', 'SI', 2023, 'active', 5),
  ('94cea4fd-0635-ff9d-6c6b-ef26a03d27b2', 'mahasiswa9@siakad.demo', '22020009', 'SI', 2022, 'active', 7),
  ('981eb403-b97b-0905-4753-b59a0afc2d48', 'mahasiswa10@siakad.demo', '21020010', 'SI', 2021, 'leave', 8),
  ('db8f5cf3-61a6-0fdd-7e7e-565ccfb318c1', 'mahasiswa11@siakad.demo', '24030011', 'MJ', 2024, 'active', 3),
  ('7434bb00-578f-e0d9-ea13-43c2f74b46ae', 'mahasiswa12@siakad.demo', '23030012', 'MJ', 2023, 'active', 5),
  ('c48baa6f-acc2-3e1b-2bca-bbf6cbf12f71', 'mahasiswa13@siakad.demo', '22040013', 'AK', 2022, 'active', 7),
  ('1fd36942-15c1-6f50-4814-c215a7415507', 'mahasiswa14@siakad.demo', '21040014', 'AK', 2021, 'graduated', 8),
  ('0eabea25-cd40-6d70-88b5-26068b74ba49', 'mahasiswa15@siakad.demo', '24050015', 'IH', 2024, 'active', 3),
  ('c2ad9578-ccc2-768d-4e7b-eeebea84a669', 'mahasiswa16@siakad.demo', '23010016', 'TI', 2023, 'active', 5),
  ('88f5401c-86a4-e628-a718-7f7f36b84965', 'mahasiswa17@siakad.demo', '22020017', 'SI', 2022, 'active', 7),
  ('23ffdd84-c9de-9eb4-2802-1bfcda4d6b34', 'mahasiswa18@siakad.demo', '21030018', 'MJ', 2021, 'active', 8),
  ('7d8a35cf-8def-cd87-e1d6-89d30de22773', 'mahasiswa19@siakad.demo', '24010019', 'TI', 2024, 'dropout', 3),
  ('a291d900-2ae0-ab2d-3ed1-1baf961f8b86', 'mahasiswa20@siakad.demo', '23020020', 'SI', 2023, 'active', 5)
) AS v(id, email, student_number, study_program_code, entry_year, academic_status, current_semester)
JOIN users u ON u.email = v.email
JOIN study_programs sp ON sp.code = v.study_program_code
ON CONFLICT (student_number) DO UPDATE SET
  profile_id       = EXCLUDED.profile_id,
  study_program_id = EXCLUDED.study_program_id,
  entry_year       = EXCLUDED.entry_year,
  academic_status  = EXCLUDED.academic_status,
  current_semester = EXCLUDED.current_semester;

-- ============================================================
-- CLASSES (20, one per course, active semester)
-- ============================================================
INSERT INTO classes (id, course_id, lecturer_id, academic_year_id, semester_id, class_name, capacity, status)
SELECT v.id::uuid, c.id, l.id, y.id, sem.id, v.class_name, v.capacity, v.status::class_status
FROM (VALUES
  ('3f1694d1-dc10-67a3-a718-7e965c7a5c2a', 'TI101', '01010001', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('525d142c-b771-ea2f-f844-cdb27bf93cf4', 'TI102', '01010002', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('ca89b149-f5d8-3346-34f3-0e8c14440dc0', 'TI201', '01010003', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('10eee011-da15-2fe1-a509-e4fd4c733e64', 'TI202', '01010004', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('41b19aaf-0f6b-b970-59c1-05fb632468b3', 'TI203', '01010005', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('ccf1d2ef-da4e-fba1-fc0b-89d882842357', 'TI204', '01010006', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('dd3c1109-675c-c8c5-0ecb-685387e6a046', 'TI301', '01010007', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('efbbedc0-72f8-3d1c-db32-ae848f6c9803', 'TI302', '01010008', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('dc7ebd84-07e6-0c14-e563-57eb4a49f2e5', 'TI303', '01010009', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('b2b99e4f-1784-77f3-c998-07c5a6b4b9be', 'TI304', '01010010', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('de610dc2-6feb-191a-0567-f157b6ab69fc', 'SI101', '01010011', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('2ed96bbd-5f6d-fe3c-2097-44d6b152b62d', 'SI201', '01010012', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('2528253b-fea1-62e7-00fc-c013d9edacf6', 'SI202', '01010013', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('659a3a7e-c63c-f013-3830-1f486969c521', 'SI301', '01010014', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('944a3c5a-4064-82fa-dfd7-364555c3496a', 'MJ101', '01010015', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('7e51dff0-96f9-e5c4-fec8-cb26d18d0944', 'MJ201', '01010001', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('8edebf58-69d2-a048-b0cc-ae7fb98be56b', 'MJ202', '01010002', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('2ad95bd2-372c-38ae-c14a-6992624011df', 'AK101', '01010003', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('b89dada1-9309-e13a-842a-6a638707fa88', 'AK201', '01010004', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open'),
  ('34b6930f-b7f6-86e3-5915-d77ff1cd5646', 'IH101', '01010005', '2025/2026', 'Ganjil 2025/2026', 'A', 40, 'open')
) AS v(id, course_code, lecturer_number, year_label, semester_name, class_name, capacity, status)
JOIN courses c ON c.course_code = v.course_code
JOIN lecturers l ON l.lecturer_number = v.lecturer_number
JOIN academic_years y ON y.year_label = v.year_label
JOIN semesters sem ON sem.name = v.semester_name
ON CONFLICT (id) DO UPDATE SET
  lecturer_id = EXCLUDED.lecturer_id,
  capacity    = EXCLUDED.capacity,
  status      = EXCLUDED.status;

-- ============================================================
-- CLASS SCHEDULES (20, one per class, conflict-free room/day/time)
-- ============================================================
INSERT INTO class_schedules (id, class_id, room_id, day_of_week, start_time, end_time)
SELECT v.id::uuid, v.class_id::uuid, r.id, v.day::day_of_week, v.start_time::time, v.end_time::time
FROM (VALUES
  ('73f5d386-a982-d888-a07b-e03fcbbb8047', '3f1694d1-dc10-67a3-a718-7e965c7a5c2a', 'A101', 'monday', '08:00', '09:40'),
  ('6668f188-e9b1-9910-77fa-419a675390c7', '525d142c-b771-ea2f-f844-cdb27bf93cf4', 'B201', 'monday', '08:00', '09:40'),
  ('8e02adb1-e74d-2700-7cc3-22b903b03353', 'ca89b149-f5d8-3346-34f3-0e8c14440dc0', 'A102', 'monday', '08:00', '09:40'),
  ('2a53f576-3e8a-b4f4-f8ab-b3d123c56a3b', '10eee011-da15-2fe1-a509-e4fd4c733e64', 'A103', 'monday', '08:00', '09:40'),
  ('445ef637-f0dc-dca1-21a7-bc6ac8d38db6', '41b19aaf-0f6b-b970-59c1-05fb632468b3', 'A201', 'monday', '08:00', '09:40'),
  ('fa67a942-2340-c9a3-21cb-04ea4cf70585', 'ccf1d2ef-da4e-fba1-fc0b-89d882842357', 'B101', 'monday', '08:00', '09:40'),
  ('6048bb0a-6eb6-b069-659a-2279eabc56fb', 'dd3c1109-675c-c8c5-0ecb-685387e6a046', 'B202', 'monday', '08:00', '09:40'),
  ('84e8211e-de22-6858-5de6-db104d950703', 'efbbedc0-72f8-3d1c-db32-ae848f6c9803', 'B203', 'monday', '08:00', '09:40'),
  ('73cc7edd-2673-d05a-4795-05de18e65154', 'dc7ebd84-07e6-0c14-e563-57eb4a49f2e5', 'C101', 'monday', '08:00', '09:40'),
  ('bdd02919-17bd-b9c4-166d-b4d9a5ec41d9', 'b2b99e4f-1784-77f3-c998-07c5a6b4b9be', 'C102', 'monday', '08:00', '09:40'),
  ('eb81001b-d3e0-2559-03ab-cc043d6f3bc5', 'de610dc2-6feb-191a-0567-f157b6ab69fc', 'C201', 'monday', '08:00', '09:40'),
  ('2ff8c16e-fd9e-80f3-c5b7-1b712c7b4c4a', '2ed96bbd-5f6d-fe3c-2097-44d6b152b62d', 'D101', 'monday', '08:00', '09:40'),
  ('beb17661-c271-8537-dda5-0d18ddc0f05b', '2528253b-fea1-62e7-00fc-c013d9edacf6', 'D102', 'monday', '08:00', '09:40'),
  ('af58047b-c373-b4d8-4bb1-84c34c1a4aea', '659a3a7e-c63c-f013-3830-1f486969c521', 'D201', 'monday', '08:00', '09:40'),
  ('44ad297f-8c69-f6ea-c1c8-043027cbff92', '944a3c5a-4064-82fa-dfd7-364555c3496a', 'D202', 'monday', '08:00', '09:40'),
  ('ad2bace6-9930-6296-cea9-de5e678f5ee5', '7e51dff0-96f9-e5c4-fec8-cb26d18d0944', 'A101', 'tuesday', '08:00', '09:40'),
  ('e565843a-78fc-c309-f8d1-eb8dc58b369d', '8edebf58-69d2-a048-b0cc-ae7fb98be56b', 'B201', 'tuesday', '08:00', '09:40'),
  ('c2162522-976d-c758-fb5b-38f9854919b0', '2ad95bd2-372c-38ae-c14a-6992624011df', 'A102', 'tuesday', '08:00', '09:40'),
  ('777af30d-3abe-229b-1b84-f9ba84586498', 'b89dada1-9309-e13a-842a-6a638707fa88', 'A103', 'tuesday', '08:00', '09:40'),
  ('195b1850-77f6-18be-6073-088cbff27921', '34b6930f-b7f6-86e3-5915-d77ff1cd5646', 'A201', 'tuesday', '08:00', '09:40')
) AS v(id, class_id, room_code, day, start_time, end_time)
JOIN rooms r ON r.code = v.room_code
ON CONFLICT (id) DO UPDATE SET
  room_id     = EXCLUDED.room_id,
  day_of_week = EXCLUDED.day_of_week,
  start_time  = EXCLUDED.start_time,
  end_time    = EXCLUDED.end_time;

-- ============================================================
-- STUDENT ADVISORS (20, one per student, active year)
-- ============================================================
INSERT INTO student_advisors (id, student_id, lecturer_id, academic_year_id)
SELECT gen_random_uuid(), s.id, l.id, y.id
FROM (VALUES
  ('24010001', '01010002', '2025/2026'),
  ('24010002', '01010002', '2025/2026'),
  ('23010003', '01010003', '2025/2026'),
  ('23010004', '01010004', '2025/2026'),
  ('22010005', '01010005', '2025/2026'),
  ('22010006', '01010006', '2025/2026'),
  ('24020007', '01010007', '2025/2026'),
  ('23020008', '01010008', '2025/2026'),
  ('22020009', '01010009', '2025/2026'),
  ('21020010', '01010010', '2025/2026'),
  ('24030011', '01010011', '2025/2026'),
  ('23030012', '01010012', '2025/2026'),
  ('22040013', '01010013', '2025/2026'),
  ('21040014', '01010014', '2025/2026'),
  ('24050015', '01010015', '2025/2026'),
  ('23010016', '01010001', '2025/2026'),
  ('22020017', '01010002', '2025/2026'),
  ('21030018', '01010003', '2025/2026'),
  ('24010019', '01010004', '2025/2026'),
  ('23020020', '01010005', '2025/2026')
) AS v(student_number, lecturer_number, year_label)
JOIN students s ON s.student_number = v.student_number
JOIN lecturers l ON l.lecturer_number = v.lecturer_number
JOIN academic_years y ON y.year_label = v.year_label
ON CONFLICT (student_id, academic_year_id) DO UPDATE SET
  lecturer_id = EXCLUDED.lecturer_id;

-- ============================================================
-- COURSE REGISTRATIONS / KRS (15 students, mixed statuses)
-- ============================================================
INSERT INTO course_registrations (id, student_id, academic_year_id, semester_id, status, submitted_at, rejection_reason)
SELECT gen_random_uuid(), s.id, y.id, sem.id, v.status::krs_status, v.submitted_at, v.rejection_reason
FROM (VALUES
  ('24010001', 'approved', now(), NULL),
  ('24010002', 'approved', now(), NULL),
  ('23010003', 'approved', now(), NULL),
  ('23010004', 'approved', now(), NULL),
  ('22010005', 'approved', now(), NULL),
  ('22010006', 'submitted', now(), NULL),
  ('24020007', 'submitted', now(), NULL),
  ('23020008', 'submitted', now(), NULL),
  ('22020009', 'submitted', now(), NULL),
  ('21020010', 'draft', NULL::timestamptz, NULL),
  ('24030011', 'draft', NULL::timestamptz, NULL),
  ('23030012', 'draft', NULL::timestamptz, NULL),
  ('22040013', 'rejected', now(), 'SKS prasyarat belum terpenuhi'),
  ('21040014', 'rejected', now(), 'SKS prasyarat belum terpenuhi'),
  ('24050015', 'approved', now(), NULL)
) AS v(student_number, status, submitted_at, rejection_reason)
JOIN students s ON s.student_number = v.student_number
CROSS JOIN (SELECT id FROM academic_years WHERE year_label = '2025/2026') y
CROSS JOIN (SELECT id FROM semesters WHERE name = 'Ganjil 2025/2026') sem
ON CONFLICT (student_id, academic_year_id, semester_id) DO UPDATE SET
  status           = EXCLUDED.status,
  submitted_at     = EXCLUDED.submitted_at,
  rejection_reason = EXCLUDED.rejection_reason;

-- ============================================================
-- COURSE REGISTRATION ITEMS
-- ============================================================
INSERT INTO course_registration_items (id, course_registration_id, class_id)
SELECT gen_random_uuid(), cr.id, v.class_id::uuid
FROM (VALUES
  ('24010001', '3f1694d1-dc10-67a3-a718-7e965c7a5c2a'),
  ('24010001', '525d142c-b771-ea2f-f844-cdb27bf93cf4'),
  ('24010002', '525d142c-b771-ea2f-f844-cdb27bf93cf4'),
  ('24010002', 'ca89b149-f5d8-3346-34f3-0e8c14440dc0'),
  ('23010003', 'ca89b149-f5d8-3346-34f3-0e8c14440dc0'),
  ('23010003', '10eee011-da15-2fe1-a509-e4fd4c733e64'),
  ('23010004', '10eee011-da15-2fe1-a509-e4fd4c733e64'),
  ('23010004', '41b19aaf-0f6b-b970-59c1-05fb632468b3'),
  ('22010005', '41b19aaf-0f6b-b970-59c1-05fb632468b3'),
  ('22010005', 'ccf1d2ef-da4e-fba1-fc0b-89d882842357'),
  ('22010006', 'ccf1d2ef-da4e-fba1-fc0b-89d882842357'),
  ('22010006', 'dd3c1109-675c-c8c5-0ecb-685387e6a046'),
  ('24020007', '2528253b-fea1-62e7-00fc-c013d9edacf6'),
  ('24020007', '659a3a7e-c63c-f013-3830-1f486969c521'),
  ('23020008', '659a3a7e-c63c-f013-3830-1f486969c521'),
  ('23020008', 'de610dc2-6feb-191a-0567-f157b6ab69fc'),
  ('22020009', 'de610dc2-6feb-191a-0567-f157b6ab69fc'),
  ('22020009', '2ed96bbd-5f6d-fe3c-2097-44d6b152b62d'),
  ('21020010', '2ed96bbd-5f6d-fe3c-2097-44d6b152b62d'),
  ('21020010', '2528253b-fea1-62e7-00fc-c013d9edacf6'),
  ('24030011', '7e51dff0-96f9-e5c4-fec8-cb26d18d0944'),
  ('24030011', '8edebf58-69d2-a048-b0cc-ae7fb98be56b'),
  ('23030012', '8edebf58-69d2-a048-b0cc-ae7fb98be56b'),
  ('23030012', '944a3c5a-4064-82fa-dfd7-364555c3496a'),
  ('22040013', '2ad95bd2-372c-38ae-c14a-6992624011df'),
  ('22040013', 'b89dada1-9309-e13a-842a-6a638707fa88'),
  ('21040014', 'b89dada1-9309-e13a-842a-6a638707fa88'),
  ('21040014', '2ad95bd2-372c-38ae-c14a-6992624011df'),
  ('24050015', '34b6930f-b7f6-86e3-5915-d77ff1cd5646')
) AS v(student_number, class_id)
JOIN students s ON s.student_number = v.student_number
JOIN course_registrations cr ON cr.student_id = s.id
  AND cr.semester_id = (SELECT id FROM semesters WHERE name = 'Ganjil 2025/2026')
ON CONFLICT (course_registration_id, class_id) DO UPDATE SET
  class_id = EXCLUDED.class_id;

-- ============================================================
-- GRADES (for approved KRS items)
-- ============================================================
INSERT INTO grades (id, student_id, class_id, assignment_score, midterm_score, final_score, final_numeric_score, final_letter_grade, grade_point, is_published, is_locked)
SELECT gen_random_uuid(), s.id, v.class_id::uuid, v.assignment, v.midterm, v.final, v.numeric, v.letter, v.point, v.published, v.locked
FROM (VALUES
  ('24010001', '3f1694d1-dc10-67a3-a718-7e965c7a5c2a', 70, 65, 60, 64, 'C+', 2.3, true, true),
  ('24010001', '525d142c-b771-ea2f-f844-cdb27bf93cf4', 75, 74, 63, 69, 'B-', 2.7, true, true),
  ('24010002', '525d142c-b771-ea2f-f844-cdb27bf93cf4', 77, 70, 69, 71, 'B', 3, true, false),
  ('24010002', 'ca89b149-f5d8-3346-34f3-0e8c14440dc0', 82, 79, 72, 76, 'B+', 3.3, true, false),
  ('23010003', 'ca89b149-f5d8-3346-34f3-0e8c14440dc0', 84, 75, 78, 78, 'B+', 3.3, true, false),
  ('23010003', '10eee011-da15-2fe1-a509-e4fd4c733e64', 89, 84, 81, 84, 'A-', 3.7, true, false),
  ('23010004', '10eee011-da15-2fe1-a509-e4fd4c733e64', 91, 80, 87, 86, 'A', 4, true, false),
  ('23010004', '41b19aaf-0f6b-b970-59c1-05fb632468b3', 71, 89, 90, 86, 'A', 4, true, false),
  ('22010005', '41b19aaf-0f6b-b970-59c1-05fb632468b3', 73, 85, 61, 71, 'B', 3, true, false),
  ('22010005', 'ccf1d2ef-da4e-fba1-fc0b-89d882842357', 78, 94, 64, 76, 'B+', 3.3, true, false),
  ('24050015', '34b6930f-b7f6-86e3-5915-d77ff1cd5646', 93, 75, 81, 82, 'A-', 3.7, true, false)
) AS v(student_number, class_id, assignment, midterm, final, numeric, letter, point, published, locked)
JOIN students s ON s.student_number = v.student_number
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
INSERT INTO academic_program_periods (id, program_type, academic_year_id, semester_id, name, registration_start, registration_end, min_credits, min_gpa, supervisor_quota_default, is_active)
SELECT v.id::uuid, v.program_type::academic_program_type, y.id, sem.id, v.name, v.registration_start::date, v.registration_end::date, 100, 2.75, 8, v.is_active
FROM (VALUES
  ('b47ee824-5e2c-27a2-4755-7cc7ea85a582', 'kkn', '2025/2026', 'Ganjil 2025/2026', 'KKN Ganjil 2025/2026', '2025-08-01', '2025-08-31', true),
  ('c1698a4f-693b-c16f-f7b4-0679abdaed67', 'kkn', '2024/2025', 'Genap 2024/2025', 'KKN Genap 2024/2025', '2025-01-01', '2025-01-31', false),
  ('521f0c61-42ca-cad2-66d3-552b5fe3b85e', 'ta', '2025/2026', 'Ganjil 2025/2026', 'TA Ganjil 2025/2026', '2025-08-01', '2025-08-31', true),
  ('5bed276b-f2d8-40d8-2964-2a6499e0333a', 'ta', '2024/2025', 'Genap 2024/2025', 'TA Genap 2024/2025', '2025-01-01', '2025-01-31', false),
  ('c848db00-77a2-bae0-dec5-9c7228af426b', 'kp', '2025/2026', 'Ganjil 2025/2026', 'KP Ganjil 2025/2026', '2025-08-01', '2025-08-31', true),
  ('37e52a37-931c-7436-2290-f792301c4521', 'kp', '2024/2025', 'Genap 2024/2025', 'KP Genap 2024/2025', '2025-01-01', '2025-01-31', false)
) AS v(id, program_type, year_label, semester_name, name, registration_start, registration_end, is_active)
JOIN academic_years y ON y.year_label = v.year_label
JOIN semesters sem ON sem.name = v.semester_name
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
INSERT INTO academic_program_registrations (id, period_id, student_id, proposal_title, status, prerequisite_credits, prerequisite_gpa, prerequisite_passed, rejection_reason, final_score, final_letter_grade, grade_point)
SELECT v.id::uuid, v.period_id::uuid, s.id, v.title, v.status::academic_program_registration_status, 100, 3.00, true, v.rejection_reason, v.final_score, v.final_letter_grade, v.grade_point
FROM (VALUES
  ('48f8ab2f-346a-2c63-1b8d-cec141009869', 'b47ee824-5e2c-27a2-4755-7cc7ea85a582', '24010001', 'KKN — Ahmad Fauzi', 'pending', NULL, NULL, NULL, NULL),
  ('1c18f398-cf2b-099c-f40b-1abe288b314d', 'b47ee824-5e2c-27a2-4755-7cc7ea85a582', '24010002', 'KKN — Bunga Citra Dewi', 'approved', NULL, NULL, NULL, NULL),
  ('66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e', 'c1698a4f-693b-c16f-f7b4-0679abdaed67', '23010003', 'KKN — Chandra Wijaya', 'active', NULL, NULL, NULL, NULL),
  ('5cf7d641-66d9-08db-a00a-e5cc9c916fc2', 'c1698a4f-693b-c16f-f7b4-0679abdaed67', '23010004', 'KKN — Dian Puspita', 'completed', NULL, 88, 'A-', 3.7),
  ('eb1a6f5e-87ba-b1f8-30fa-875b0547814a', '521f0c61-42ca-cad2-66d3-552b5fe3b85e', '22010005', 'Tugas Akhir — Eko Prasetyo', 'rejected', 'Prasyarat SKS belum terpenuhi', NULL, NULL, NULL),
  ('1ce84193-42b5-7eff-76fe-5428c329aa23', '521f0c61-42ca-cad2-66d3-552b5fe3b85e', '22010006', 'Tugas Akhir — Fitri Handayani', 'active', NULL, NULL, NULL, NULL),
  ('798390cb-f72d-380e-86f7-49d5a64677e8', '5bed276b-f2d8-40d8-2964-2a6499e0333a', '24020007', 'Tugas Akhir — Gilang Ramadhan', 'pending', NULL, NULL, NULL, NULL),
  ('f1e5e28e-2b63-8990-8209-11b1711df48a', '5bed276b-f2d8-40d8-2964-2a6499e0333a', '23020008', 'Tugas Akhir — Hesti Nuraini', 'approved', NULL, NULL, NULL, NULL),
  ('ff90abda-b7f0-e40e-8b39-310db403949a', 'c848db00-77a2-bae0-dec5-9c7228af426b', '22020009', 'Kerja Praktek — Indra Kusuma', 'active', NULL, NULL, NULL, NULL),
  ('cb3fd82f-0fd4-f077-27ba-b09f18632826', 'c848db00-77a2-bae0-dec5-9c7228af426b', '21020010', 'Kerja Praktek — Jasmine Putri', 'completed', NULL, 88, 'A-', 3.7),
  ('a8c91b4b-009d-1490-fdb9-87a420fe3278', '37e52a37-931c-7436-2290-f792301c4521', '24030011', 'Kerja Praktek — Kevin Saputra', 'rejected', 'Prasyarat SKS belum terpenuhi', NULL, NULL, NULL),
  ('7fb20dca-1195-048e-d73a-d61ed7ec4f26', '37e52a37-931c-7436-2290-f792301c4521', '23030012', 'Kerja Praktek — Lestari Wulandari', 'active', NULL, NULL, NULL, NULL)
) AS v(id, period_id, student_number, title, status, rejection_reason, final_score, final_letter_grade, grade_point)
JOIN students s ON s.student_number = v.student_number
ON CONFLICT (period_id, student_id) DO UPDATE SET
  status      = EXCLUDED.status,
  final_score = EXCLUDED.final_score;

-- ============================================================
-- ACADEMIC PROGRAM ASSIGNMENTS (dosen pembimbing)
-- ============================================================
INSERT INTO academic_program_assignments (id, registration_id, lecturer_id, assignment_role)
SELECT v.id::uuid, v.registration_id::uuid, l.id, v.role::academic_program_assignment_role
FROM (VALUES
  ('b1048172-b16b-4dfe-7dc4-fe51f6b7ca39', '1c18f398-cf2b-099c-f40b-1abe288b314d', '01010002', 'supervisor'),
  ('3b1cba23-7a90-c9ef-f1a6-4587350d054d', '66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e', '01010003', 'supervisor'),
  ('fc61d77d-450d-5789-1fb7-a7b9640a85ad', '5cf7d641-66d9-08db-a00a-e5cc9c916fc2', '01010004', 'supervisor'),
  ('f7adc6eb-3c65-1745-e019-132d0b87b0ba', '1ce84193-42b5-7eff-76fe-5428c329aa23', '01010006', 'supervisor'),
  ('5dba8803-3fbe-5f57-b76a-4cdf0166eca5', 'f1e5e28e-2b63-8990-8209-11b1711df48a', '01010008', 'supervisor'),
  ('e892114b-521a-4b2f-5d8f-a1754fc89c9b', 'ff90abda-b7f0-e40e-8b39-310db403949a', '01010009', 'supervisor'),
  ('ff09c66f-884a-9618-177a-98c98218ebe6', 'cb3fd82f-0fd4-f077-27ba-b09f18632826', '01010010', 'supervisor'),
  ('1a1dc357-3314-9fae-ec53-6a9493a7483d', '7fb20dca-1195-048e-d73a-d61ed7ec4f26', '01010012', 'supervisor')
) AS v(id, registration_id, lecturer_number, role)
JOIN lecturers l ON l.lecturer_number = v.lecturer_number
ON CONFLICT (registration_id, lecturer_id, assignment_role) DO UPDATE SET
  assignment_role = EXCLUDED.assignment_role;

-- ============================================================
-- ACADEMIC PROGRAM LOGBOOKS
-- ============================================================
INSERT INTO academic_program_logbooks (id, registration_id, student_id, entry_date, week_number, activity, status)
SELECT v.id::uuid, v.registration_id::uuid, s.id, v.entry_date::date, v.week_number, v.activity, v.status::academic_program_logbook_status
FROM (VALUES
  ('2447a6a3-7155-473e-4ff1-79a4f1e6cf81', '66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e', '23010003', '2025-08-05', 1, 'Survei lokasi dan koordinasi awal', 'accepted'),
  ('47760ffb-ce5c-785d-6729-eef897aa9511', '66cacfa4-2c9c-f3e7-cfb4-4c627ca38f8e', '23010003', '2025-08-10', 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'),
  ('b47a4ef9-f2e9-b9f9-02ff-008e0890d96c', '5cf7d641-66d9-08db-a00a-e5cc9c916fc2', '23010004', '2025-08-05', 1, 'Survei lokasi dan koordinasi awal', 'accepted'),
  ('5a735cb8-783b-6835-b829-6d6c9c6c1651', '5cf7d641-66d9-08db-a00a-e5cc9c916fc2', '23010004', '2025-08-10', 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'),
  ('7f845980-5369-4515-b121-728c7448e2e4', '1ce84193-42b5-7eff-76fe-5428c329aa23', '22010006', '2025-08-05', 1, 'Survei lokasi dan koordinasi awal', 'accepted'),
  ('d199f093-437b-1f4a-62fa-3569e0535693', '1ce84193-42b5-7eff-76fe-5428c329aa23', '22010006', '2025-08-10', 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'),
  ('76b6c219-9959-10c4-eb44-f4ae767fcd1b', 'ff90abda-b7f0-e40e-8b39-310db403949a', '22020009', '2025-08-05', 1, 'Survei lokasi dan koordinasi awal', 'accepted'),
  ('129940ac-5ceb-42f1-9f77-d786589298d9', 'ff90abda-b7f0-e40e-8b39-310db403949a', '22020009', '2025-08-10', 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'),
  ('2cf7b2f9-ea93-0be1-cbba-be66ba28f637', 'cb3fd82f-0fd4-f077-27ba-b09f18632826', '21020010', '2025-08-05', 1, 'Survei lokasi dan koordinasi awal', 'accepted'),
  ('881a14a5-b3f3-cb4b-97ea-048dd0557803', 'cb3fd82f-0fd4-f077-27ba-b09f18632826', '21020010', '2025-08-10', 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending'),
  ('90e9d4c5-f241-6060-06ee-e721383e02d6', '7fb20dca-1195-048e-d73a-d61ed7ec4f26', '23030012', '2025-08-05', 1, 'Survei lokasi dan koordinasi awal', 'accepted'),
  ('e1177975-7467-2620-bff3-737aa066f999', '7fb20dca-1195-048e-d73a-d61ed7ec4f26', '23030012', '2025-08-10', 2, 'Pelaksanaan kegiatan minggu ke-2', 'pending')
) AS v(id, registration_id, student_number, entry_date, week_number, activity, status)
JOIN students s ON s.student_number = v.student_number
ON CONFLICT (id) DO UPDATE SET
  activity = EXCLUDED.activity,
  status   = EXCLUDED.status;

-- ============================================================
-- ACADEMIC PROGRAM ASSESSMENTS
-- ============================================================
INSERT INTO academic_program_assessments (id, registration_id, rubric_id, assessor_id, score)
SELECT v.id::uuid, v.registration_id::uuid, v.rubric_id::uuid, l.id, v.score
FROM (VALUES
  ('2a3887b2-d77b-532a-9ca6-1094fa162a1b', '5cf7d641-66d9-08db-a00a-e5cc9c916fc2', 'aee92e67-190f-4bfd-5b7f-3a5d5437e5cc', '01010004', 88),
  ('e416a3cf-ee87-ecb2-1616-eaa18e9dcb3a', '5cf7d641-66d9-08db-a00a-e5cc9c916fc2', '6e902cea-090c-7b5c-ca49-1a38fe5c0cf7', '01010004', 88),
  ('8bab8bc9-f04d-2c0c-d97a-cbd2add17b5f', 'cb3fd82f-0fd4-f077-27ba-b09f18632826', '64775a93-0a31-6090-d325-db8e0ad2b67e', '01010010', 88),
  ('eb3e9bfe-debc-6f4f-573a-394743ebca5c', 'cb3fd82f-0fd4-f077-27ba-b09f18632826', '1f62d2dd-13a1-4990-02f4-5928537abf3f', '01010010', 88)
) AS v(id, registration_id, rubric_id, lecturer_number, score)
JOIN lecturers l ON l.lecturer_number = v.lecturer_number
ON CONFLICT (registration_id, rubric_id, assessor_id) DO UPDATE SET
  score = EXCLUDED.score;
