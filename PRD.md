Dokumen Perencanaan dan Spesifikasi Proyek
Sistem Akademik Universitas Berbasis Next.js, Supabase, dan Vercel Free Tier
1. Identitas Proyek

Nama Proyek: Sistem Akademik Universitas
Jenis Sistem: Web-based Academic Information System
Target Platform: Web application
Deployment Awal: Vercel Hobby Free Plan
Backend-as-a-Service: Supabase Free Plan
Framework Frontend/Fullstack: Next.js terbaru dengan App Router
Status Proyek: MVP / Prototype / Pilot Internal
Target Pengguna: Admin Akademik, Dosen, Mahasiswa, Ketua Program Studi, dan Super Admin

2. Latar Belakang

Sistem akademik universitas dibutuhkan untuk membantu pengelolaan data mahasiswa, dosen, mata kuliah, jadwal perkuliahan, pengisian KRS, penilaian, serta riwayat akademik mahasiswa. Pada tahap awal, sistem ini dirancang sebagai MVP yang dapat dijalankan secara gratis menggunakan Vercel dan Supabase.

Pemilihan Next.js dilakukan karena framework ini mendukung pengembangan aplikasi fullstack berbasis React, termasuk routing, server component, data fetching, form handling, caching, dan deployment modern. Next.js 16 telah tersedia dan membawa peningkatan pada Turbopack, caching, routing, dan arsitektur aplikasi; proyek baru dapat dibuat menggunakan create-next-app@latest.

Supabase digunakan sebagai backend utama karena menyediakan PostgreSQL, Authentication, Storage, Row Level Security, dan API otomatis. Supabase juga menyediakan panduan resmi untuk penggunaan Auth dengan Next.js App Router, termasuk penggunaan template with-supabase, TypeScript, Tailwind CSS, dan cookie-based authentication.

Vercel Hobby digunakan untuk deployment awal karena paket ini gratis dan mendukung Git integration, CI/CD, HTTPS otomatis, preview deployment, Vercel Functions, Middleware, Image Optimization, serta Fast Data Transfer. Namun, Vercel menyatakan bahwa Hobby Plan ditujukan untuk personal projects dan small-scale applications, sehingga sistem akademik resmi universitas sebaiknya tidak menggunakan paket gratis untuk production jangka panjang.

3. Tujuan Proyek

Tujuan utama proyek ini adalah membangun sistem akademik universitas berbasis web yang dapat digunakan untuk mengelola proses akademik dasar secara terpusat. Sistem ini diharapkan mampu:

Mengelola data mahasiswa, dosen, program studi, kelas, mata kuliah, dan tahun akademik.
Menyediakan fitur pengisian KRS bagi mahasiswa.
Menyediakan fitur pengelolaan jadwal perkuliahan.
Memfasilitasi dosen dalam input nilai mahasiswa.
Menyediakan tampilan KHS dan transkrip akademik mahasiswa.
Mengatur hak akses berdasarkan peran pengguna.
Dapat dideploy secara gratis untuk kebutuhan demo, pengujian, atau pilot internal.
Memiliki struktur kode dan database yang siap dikembangkan ke versi production.
4. Batasan Proyek

Karena proyek ini ditargetkan untuk berjalan pada free tier, sistem harus dirancang secara hemat resource. Vercel Hobby memiliki batas penggunaan seperti Function Invocations, Active CPU, Image Transformations, Web Analytics, dan batas runtime log. Jika batas penggunaan terlampaui, sebagian fitur dapat berhenti sementara sampai periode penggunaan berikutnya.

Supabase Free Plan memberikan dua free projects, database size 500 MB per project, 50.000 Monthly Active Users, dan 5 GB egress. Jika database melebihi 500 MB, proyek Free Plan dapat masuk ke mode read-only.
Dengan batasan tersebut, sistem ini tidak disarankan untuk langsung dipakai sebagai sistem akademik resmi berskala universitas besar. Penggunaan free tier cocok untuk:

Demo tugas akhir atau portofolio.
MVP internal.
Pilot untuk satu program studi.
Pengujian fitur sebelum migrasi ke paket berbayar.
Simulasi sistem akademik dengan data terbatas.
5. Ruang Lingkup Sistem
5.1 Fitur yang Termasuk dalam MVP

MVP sistem akademik mencakup beberapa modul utama:

Autentikasi dan otorisasi pengguna.
Manajemen role pengguna.
Dashboard berdasarkan role.
Manajemen mahasiswa.
Manajemen dosen.
Manajemen program studi.
Manajemen mata kuliah.
Manajemen kelas.
Manajemen jadwal kuliah.
Pengisian KRS mahasiswa.
Persetujuan atau validasi KRS oleh dosen wali atau admin akademik.
Input nilai oleh dosen.
Tampilan KHS mahasiswa.
Tampilan transkrip akademik.
Riwayat aktivitas akademik sederhana.
Export data sederhana ke CSV atau PDF.
5.2 Fitur di Luar MVP

Beberapa fitur tidak dimasukkan pada tahap awal karena membutuhkan resource, validasi, dan integrasi yang lebih kompleks:

Integrasi pembayaran UKT.
Integrasi SSO kampus.
Integrasi PDDikti.
Sistem presensi berbasis QR atau face recognition.
Notifikasi WhatsApp atau email massal.
Mobile app native.
Multi-kampus atau multi-tenant kompleks.
Audit log tingkat enterprise.
Backup otomatis tingkat institusi.
Load balancing dan high availability.
6. Stakeholder dan Role Pengguna
6.1 Super Admin

Super Admin bertanggung jawab terhadap konfigurasi utama sistem. Role ini memiliki akses tertinggi untuk mengatur pengguna, role, program studi, tahun akademik, serta konfigurasi sistem.

Hak akses:

Mengelola seluruh user.
Mengatur role dan permission.
Mengelola data fakultas dan program studi.
Mengelola tahun akademik dan semester.
Melihat seluruh data akademik.
Melakukan konfigurasi sistem.
6.2 Admin Akademik

Admin Akademik bertanggung jawab terhadap operasional akademik harian.

Hak akses:

Mengelola data mahasiswa.
Mengelola data dosen.
Mengelola mata kuliah.
Mengatur kelas dan jadwal.
Memvalidasi KRS.
Melihat data nilai.
Mengelola status akademik mahasiswa.
6.3 Ketua Program Studi

Ketua Program Studi memiliki akses untuk memantau proses akademik di program studinya.

Hak akses:

Melihat data mahasiswa pada program studi terkait.
Melihat data dosen.
Melihat jadwal kuliah.
Melihat rekap nilai.
Melihat statistik akademik.
Menyetujui konfigurasi mata kuliah tertentu jika diperlukan.
6.4 Dosen

Dosen menggunakan sistem untuk melihat jadwal mengajar, daftar mahasiswa, dan menginput nilai.

Hak akses:

Melihat jadwal mengajar.
Melihat daftar peserta kelas.
Menginput nilai mahasiswa.
Melihat riwayat kelas yang pernah diajar.
Menjadi dosen wali untuk validasi KRS mahasiswa.
6.5 Mahasiswa

Mahasiswa menggunakan sistem untuk melakukan aktivitas akademik pribadi.

Hak akses:

Melihat profil akademik.
Mengisi KRS.
Melihat status KRS.
Melihat jadwal kuliah.
Melihat KHS.
Melihat transkrip akademik.
Mengunduh dokumen akademik sederhana.
7. Arsitektur Sistem

Arsitektur sistem menggunakan pola serverless fullstack sederhana.

Browser pengguna mengakses aplikasi Next.js yang dideploy di Vercel. Next.js menangani UI, routing, server components, server actions, route handlers, validasi form, dan proteksi halaman. Supabase digunakan sebagai backend utama yang mencakup database PostgreSQL, authentication, storage, dan row level security.

Struktur komunikasi sistem:

User Browser
   ↓
Next.js App on Vercel
   ↓
Supabase Client / Server SDK
   ↓
Supabase Auth + PostgreSQL + Storage + RLS

Pendekatan ini dipilih agar sistem dapat dibangun tanpa server backend terpisah. Untuk MVP, business logic utama dapat ditempatkan pada Server Actions, Route Handlers, atau PostgreSQL functions jika diperlukan. Next.js App Router mendukung struktur aplikasi berbasis layouts, pages, server/client components, route handlers, data fetching, data mutation, dan caching.

8. Teknologi yang Digunakan
8.1 Frontend dan Fullstack
Next.js terbaru
React
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
TanStack Table
Lucide React
Recharts untuk dashboard statistik
8.2 Backend dan Database
Supabase PostgreSQL
Supabase Auth
Supabase Row Level Security
Supabase Storage
Supabase SQL Functions jika diperlukan
Supabase Realtime hanya untuk fitur ringan
8.3 Deployment dan DevOps
Vercel Hobby Plan
GitHub Repository
Vercel Git Integration
Preview Deployment
Environment Variables di Vercel
Supabase Dashboard
Supabase SQL Editor
Supabase Migration File
8.4 Testing
Vitest untuk unit test
Playwright untuk end-to-end test
ESLint
TypeScript strict mode
Manual user acceptance testing
9. Struktur Modul Sistem
9.1 Modul Authentication

Modul ini menangani login, logout, session, proteksi halaman, dan redirect berdasarkan role.

Fitur:

Login menggunakan email dan password.
Logout.
Session check.
Redirect berdasarkan role.
Proteksi route dashboard.
Sinkronisasi user Supabase Auth dengan tabel profiles.

Supabase Auth dengan Next.js direkomendasikan menggunakan cookie-based authentication agar session dapat dibaca pada server-side flow. Supabase juga menyarankan penggunaan environment variable NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY untuk konfigurasi proyek Next.js.

9.2 Modul User dan Role Management

Modul ini digunakan untuk mengatur data pengguna dan hak akses.

Fitur:

Tambah user.
Edit user.
Nonaktifkan user.
Atur role.
Hubungkan user dengan data mahasiswa atau dosen.
Filter user berdasarkan role.

Role awal:

super_admin
admin_akademik
kaprodi
dosen
mahasiswa
9.3 Modul Master Data Akademik

Modul ini menyimpan data dasar akademik.

Fitur:

Fakultas.
Program studi.
Tahun akademik.
Semester.
Kurikulum.
Mata kuliah.
Ruangan.
Kelas.
Status akademik.
9.4 Modul Mahasiswa

Modul mahasiswa digunakan untuk pengelolaan data akademik mahasiswa.

Fitur:

Tambah data mahasiswa.
Edit data mahasiswa.
Lihat detail mahasiswa.
Filter berdasarkan program studi, angkatan, dan status.
Lihat riwayat KRS.
Lihat KHS.
Lihat transkrip.
9.5 Modul Dosen

Modul dosen digunakan untuk pengelolaan data dosen.

Fitur:

Tambah data dosen.
Edit data dosen.
Lihat detail dosen.
Hubungkan dosen dengan mata kuliah.
Tetapkan dosen wali.
Tetapkan dosen pengampu kelas.
9.6 Modul Jadwal Kuliah

Modul ini mengatur penjadwalan mata kuliah.

Fitur:

Buat kelas per mata kuliah.
Tentukan dosen pengampu.
Tentukan ruangan.
Tentukan hari dan jam kuliah.
Batasi kapasitas kelas.
Deteksi bentrok jadwal sederhana.
Tampilkan jadwal berdasarkan role.
9.7 Modul KRS

Modul KRS digunakan mahasiswa untuk mengambil mata kuliah pada semester berjalan.

Fitur:

Mahasiswa melihat daftar mata kuliah yang tersedia.
Mahasiswa memilih kelas.
Sistem mengecek batas SKS.
Sistem mengecek bentrok jadwal.
Sistem menyimpan draft KRS.
Mahasiswa mengajukan KRS.
Dosen wali atau admin akademik menyetujui KRS.
Status KRS: draft, submitted, approved, rejected.
9.8 Modul Nilai

Modul nilai digunakan dosen untuk menginput nilai mahasiswa.

Fitur:

Dosen melihat daftar kelas yang diajar.
Dosen melihat daftar peserta.
Dosen input nilai tugas, UTS, UAS, dan nilai akhir.
Sistem mengonversi nilai angka ke huruf.
Dosen submit nilai.
Admin akademik dapat mengunci nilai.
Mahasiswa dapat melihat nilai setelah dipublikasikan.
9.9 Modul KHS

Modul KHS menampilkan hasil studi mahasiswa per semester.

Fitur:

Tampilkan daftar mata kuliah yang diambil.
Tampilkan SKS.
Tampilkan nilai angka.
Tampilkan nilai huruf.
Hitung IPS.
Export KHS ke PDF.
9.10 Modul Transkrip

Modul transkrip menampilkan seluruh riwayat akademik mahasiswa.

Fitur:

Tampilkan seluruh mata kuliah yang telah ditempuh.
Hitung total SKS lulus.
Hitung IPK.
Tampilkan nilai terbaik jika mata kuliah diulang.
Export transkrip sementara ke PDF.
10. Desain Database
10.1 Tabel Utama

Database menggunakan PostgreSQL pada Supabase. Struktur tabel awal:

auth.users
profiles
roles
faculties
study_programs
academic_years
semesters
students
lecturers
curriculums
courses
rooms
classes
class_schedules
student_advisors
course_registrations
course_registration_items
grade_components
grades
academic_records
activity_logs
10.2 Deskripsi Tabel

profiles
Menyimpan profil user yang terhubung dengan auth.users.

Kolom utama:

id
user_id
full_name
email
role
avatar_url
is_active
created_at
updated_at

students
Menyimpan data mahasiswa.

Kolom utama:

id
profile_id
student_number
study_program_id
entry_year
academic_status
current_semester
created_at
updated_at

lecturers
Menyimpan data dosen.

Kolom utama:

id
profile_id
lecturer_number
study_program_id
expertise
created_at
updated_at

courses
Menyimpan data mata kuliah.

Kolom utama:

id
course_code
course_name
credits
semester_recommended
study_program_id
curriculum_id
is_active

classes
Menyimpan kelas perkuliahan.

Kolom utama:

id
course_id
lecturer_id
academic_year_id
semester_id
class_name
capacity
status

class_schedules
Menyimpan jadwal kuliah.

Kolom utama:

id
class_id
room_id
day_of_week
start_time
end_time

course_registrations
Menyimpan data KRS utama.

Kolom utama:

id
student_id
academic_year_id
semester_id
status
submitted_at
approved_by
approved_at

course_registration_items
Menyimpan detail mata kuliah yang dipilih mahasiswa.

Kolom utama:

id
course_registration_id
class_id
created_at

grades
Menyimpan nilai mahasiswa.

Kolom utama:

id
student_id
class_id
assignment_score
midterm_score
final_score
final_numeric_score
final_letter_grade
grade_point
is_published
created_at
updated_at
11. Konsep Row Level Security

Supabase Row Level Security perlu diaktifkan pada tabel yang menyimpan data sensitif. Tujuannya agar user hanya dapat mengakses data sesuai hak aksesnya.

Contoh kebijakan akses:

Mahasiswa hanya dapat melihat data profil, KRS, KHS, dan transkrip miliknya.
Dosen hanya dapat melihat kelas yang diajar.
Dosen hanya dapat input nilai untuk kelas yang menjadi tanggung jawabnya.
Admin Akademik dapat mengelola data akademik dalam lingkup operasional.
Super Admin dapat mengakses seluruh data.
Kaprodi hanya dapat melihat data pada program studinya.

RLS sangat penting karena Supabase menyediakan akses API otomatis ke database. Tanpa RLS, data akademik berisiko terbaca oleh user yang tidak berwenang.

12. Struktur Folder Next.js

Struktur proyek disarankan sebagai berikut:

src/
  app/
    (auth)/
      login/
      forgot-password/
    (dashboard)/
      dashboard/
      students/
      lecturers/
      courses/
      classes/
      schedules/
      krs/
      grades/
      khs/
      transcript/
      settings/
    api/
      export/
      webhook/
    layout.tsx
    page.tsx

  components/
    ui/
    layout/
    forms/
    tables/
    dashboard/
    academic/

  features/
    auth/
    students/
    lecturers/
    courses/
    classes/
    schedules/
    krs/
    grades/
    reports/

  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    validators/
    utils.ts
    permissions.ts

  server/
    actions/
    queries/
    mutations/

  types/
    database.ts
    academic.ts

  constants/
    roles.ts
    menus.ts

Jika menggunakan Next.js 16, perlu memperhatikan perubahan dari middleware.ts ke proxy.ts untuk boundary request tertentu, karena middleware.ts telah ditandai deprecated dan digantikan oleh proxy.ts pada Next.js 16.

13. Routing Aplikasi

Routing halaman utama:

/login
/dashboard
/dashboard/students
/dashboard/lecturers
/dashboard/courses
/dashboard/classes
/dashboard/schedules
/dashboard/krs
/dashboard/grades
/dashboard/khs
/dashboard/transcript
/dashboard/settings

Routing berdasarkan role:

Super Admin:
- /dashboard
- /dashboard/users
- /dashboard/roles
- /dashboard/faculties
- /dashboard/study-programs
- /dashboard/settings

Admin Akademik:
- /dashboard/students
- /dashboard/lecturers
- /dashboard/courses
- /dashboard/classes
- /dashboard/schedules
- /dashboard/krs

Kaprodi:
- /dashboard/program-overview
- /dashboard/students
- /dashboard/lecturers
- /dashboard/classes
- /dashboard/reports

Dosen:
- /dashboard/my-classes
- /dashboard/grades
- /dashboard/advisor/krs

Mahasiswa:
- /dashboard/my-profile
- /dashboard/krs
- /dashboard/schedule
- /dashboard/khs
- /dashboard/transcript
14. Alur Pengguna
14.1 Alur Login
User membuka halaman login.
User memasukkan email dan password.
Sistem memvalidasi kredensial melalui Supabase Auth.
Sistem mengambil data profile dan role.
User diarahkan ke dashboard sesuai role.
Jika user tidak aktif, akses ditolak.
14.2 Alur Pengisian KRS
Mahasiswa login.
Mahasiswa membuka menu KRS.
Sistem menampilkan semester aktif.
Sistem menampilkan daftar kelas yang tersedia.
Mahasiswa memilih kelas.
Sistem mengecek kapasitas, bentrok jadwal, dan batas SKS.
Mahasiswa menyimpan draft.
Mahasiswa submit KRS.
Dosen wali atau Admin Akademik memvalidasi.
Status KRS berubah menjadi approved atau rejected.
14.3 Alur Input Nilai
Dosen login.
Dosen membuka menu kelas yang diajar.
Dosen memilih kelas.
Sistem menampilkan daftar mahasiswa.
Dosen mengisi komponen nilai.
Sistem menghitung nilai akhir.
Dosen menyimpan nilai.
Dosen mempublikasikan nilai.
Mahasiswa dapat melihat nilai di KHS.
15. Perencanaan UI/UX

Desain UI menggunakan pendekatan dashboard modern, sederhana, dan responsif.

Komponen utama:

Sidebar navigation.
Topbar user profile.
Dashboard cards.
Data table dengan search dan filter.
Modal form.
Stepper untuk KRS.
Badge status.
Toast notification.
Empty state.
Skeleton loading.
Confirmation dialog.
Responsive mobile layout.

Palet tampilan disarankan:

Background netral.
Primary color biru akademik.
Accent color hijau untuk status berhasil.
Warning kuning untuk pending.
Danger merah untuk rejected atau error.

Halaman prioritas:

Login page.
Dashboard overview.
Data mahasiswa.
Data dosen.
Data mata kuliah.
KRS mahasiswa.
Input nilai dosen.
KHS mahasiswa.
Transkrip mahasiswa.
16. Non-Functional Requirements
16.1 Performance

Target performa MVP:

Halaman dashboard terbuka kurang dari 3 detik pada koneksi normal.
Query data tabel utama kurang dari 2 detik untuk dataset kecil.
Pagination wajib digunakan untuk tabel besar.
Data dashboard harus dibatasi per role.
Hindari query seluruh data tanpa filter.
Gunakan server-side filtering untuk tabel besar.
16.2 Security

Kebutuhan keamanan:

Password dikelola oleh Supabase Auth.
Session menggunakan cookie-based auth.
Role checking dilakukan di server.
RLS aktif pada tabel sensitif.
Service role key tidak boleh digunakan di client.
Environment variable rahasia hanya disimpan di Vercel.
Validasi input menggunakan Zod.
Audit log disimpan untuk aktivitas penting.
File upload dibatasi tipe dan ukuran.
Data akademik tidak boleh dapat diakses lintas role.
16.3 Maintainability

Kebutuhan maintainability:

Gunakan TypeScript.
Gunakan struktur folder modular.
Pisahkan query, mutation, schema, dan UI.
Gunakan reusable component.
Gunakan migration SQL.
Gunakan naming convention konsisten.
Gunakan dokumentasi setup proyek.
16.4 Scalability

Pada free tier, scalability terbatas. Untuk pilot, sistem dapat digunakan dengan jumlah data kecil. Jika digunakan untuk production, sistem perlu upgrade ke Vercel Pro atau platform lain, serta Supabase Pro atau database managed PostgreSQL yang lebih besar.

Vercel Hobby menyediakan batas resource untuk penggunaan gratis, sedangkan Supabase Free memiliki kuota database, egress, dan MAU. Jika sistem dipakai oleh banyak mahasiswa secara serentak, potensi limit akan meningkat.

17. Rencana Deployment Gratis
17.1 Persiapan Repository
Buat repository GitHub.
Buat proyek Next.js terbaru.
Gunakan TypeScript dan Tailwind CSS.
Install Supabase package.
Buat struktur folder.
Commit initial project.
Push ke GitHub.

Command awal:

npx create-next-app@latest sistem-akademik-universitas
cd sistem-akademik-universitas
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
17.2 Persiapan Supabase
Buat project baru di Supabase.
Pilih region terdekat.
Ambil Project URL.
Ambil Publishable Key.
Buat tabel database.
Aktifkan Row Level Security.
Buat policy setiap tabel.
Buat bucket storage jika diperlukan.
Buat seed data awal.
Uji login dan akses data.

Supabase Free Plan memberi dua free projects, sehingga satu project dapat digunakan untuk development dan satu project lain untuk staging/demo jika diperlukan.

17.3 Environment Variables

File .env.local:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

Untuk Vercel Production:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=https://nama-project.vercel.app

Secret key hanya boleh dipakai pada server-side process. Jangan mengekspos secret key pada client component.

17.4 Deploy ke Vercel
Login ke Vercel.
Import repository dari GitHub.
Pilih framework Next.js.
Tambahkan environment variables.
Deploy.
Uji URL production.
Tambahkan Supabase Auth Redirect URL ke domain Vercel.
Uji login production.
Uji role-based access.
Uji CRUD data akademik.

Vercel Hobby menyediakan automatic HTTPS/SSL, CI/CD berbasis Git, dan preview deployment untuk setiap push, sehingga cocok untuk proses pengembangan cepat.

18. Rencana Pengujian
18.1 Unit Testing

Unit test dilakukan untuk:

Fungsi hitung IPK.
Fungsi hitung IPS.
Fungsi konversi nilai angka ke huruf.
Fungsi validasi batas SKS.
Fungsi deteksi bentrok jadwal.
Fungsi permission checking.
18.2 Integration Testing

Integration test dilakukan untuk:

Login user.
Ambil profile user.
Ambil data berdasarkan role.
Submit KRS.
Approve KRS.
Input nilai.
Publish nilai.
Generate KHS.
18.3 End-to-End Testing

E2E test menggunakan Playwright.

Skenario utama:

Mahasiswa login dan submit KRS.
Dosen wali approve KRS.
Dosen input nilai.
Mahasiswa melihat KHS.
Admin Akademik membuat jadwal.
Super Admin membuat user baru.
18.4 User Acceptance Testing

UAT dilakukan dengan skenario role-based:

Admin Akademik menguji master data.
Dosen menguji input nilai.
Mahasiswa menguji KRS dan KHS.
Kaprodi menguji dashboard program studi.
Super Admin menguji role dan konfigurasi.
19. Timeline Pengembangan
Minggu 1 — Setup dan Fondasi

Aktivitas:

Setup Next.js.
Setup Supabase.
Setup Vercel.
Setup Tailwind dan shadcn/ui.
Setup struktur folder.
Setup authentication.
Setup layout dashboard.

Output:

Project berjalan lokal.
Login berfungsi.
Dashboard awal tersedia.
Deployment awal berhasil.
Minggu 2 — Database dan Role

Aktivitas:

Desain tabel utama.
Buat migration SQL.
Buat tabel profiles, students, lecturers, roles.
Buat RLS dasar.
Buat role-based redirect.
Buat sidebar berdasarkan role.

Output:

Database awal siap.
Role user berjalan.
Proteksi halaman aktif.
Minggu 3 — Master Data Akademik

Aktivitas:

Modul fakultas.
Modul program studi.
Modul tahun akademik.
Modul semester.
Modul mata kuliah.
Modul ruangan.

Output:

CRUD master data tersedia.
Admin Akademik dapat mengelola data dasar.
Minggu 4 — Mahasiswa dan Dosen

Aktivitas:

Modul mahasiswa.
Modul dosen.
Relasi user dengan mahasiswa/dosen.
Filter dan pencarian.
Detail profile akademik.

Output:

Data mahasiswa dan dosen dapat dikelola.
Relasi antar user dan profile akademik tersedia.
Minggu 5 — Jadwal dan Kelas

Aktivitas:

Buat kelas per mata kuliah.
Assign dosen.
Assign ruangan.
Buat jadwal.
Validasi bentrok sederhana.
Tampilan jadwal role mahasiswa/dosen.

Output:

Jadwal kuliah tersedia.
Dosen dan mahasiswa dapat melihat jadwal masing-masing.
Minggu 6 — KRS

Aktivitas:

Halaman KRS mahasiswa.
Pilih kelas.
Validasi SKS.
Validasi bentrok.
Submit KRS.
Approve/reject KRS.

Output:

Proses KRS end-to-end berjalan.
Minggu 7 — Nilai, KHS, dan Transkrip

Aktivitas:

Input nilai dosen.
Publish nilai.
Hitung IPS.
Hitung IPK.
Tampilkan KHS.
Tampilkan transkrip.
Export sederhana.

Output:

Nilai akademik dapat dikelola.
Mahasiswa dapat melihat KHS dan transkrip.
Minggu 8 — Testing, Optimization, dan Final Deployment

Aktivitas:

Testing fitur utama.
Perbaikan bug.
Review RLS.
Optimasi query.
Review responsive UI.
Final deploy ke Vercel.
Dokumentasi setup.

Output:

MVP siap demo.
Dokumentasi teknis tersedia.
Sistem siap dipresentasikan atau diuji internal.
20. Prioritas Backlog
Prioritas Tinggi
Login dan role.
Dashboard.
Master data akademik.
Mahasiswa.
Dosen.
Mata kuliah.
Jadwal.
KRS.
Input nilai.
KHS.
Prioritas Sedang
Transkrip.
Export PDF.
Audit log sederhana.
Statistik dashboard.
Import CSV mahasiswa.
Search dan filter lanjutan.
Prioritas Rendah
Notifikasi email.
Realtime update.
Theme customization.
File storage dokumen akademik.
Advanced reporting.
Integrasi sistem eksternal.
21. Risiko dan Mitigasi
Risiko 1 — Free Tier Tidak Cukup

Free tier dapat terbatas untuk data dan traffic. Supabase Free Plan memiliki batas database 500 MB dan dapat masuk read-only jika melebihi batas tersebut.

Mitigasi:

Gunakan hanya untuk MVP.
Batasi data dummy.
Gunakan pagination.
Hindari menyimpan file besar.
Bersihkan log berkala.
Siapkan migration path ke plan berbayar.
Risiko 2 — Data Akademik Sensitif

Data mahasiswa dan nilai bersifat sensitif.

Mitigasi:

Aktifkan RLS.
Batasi akses berdasarkan role.
Jangan simpan secret key di client.
Gunakan server-side validation.
Buat audit log untuk perubahan penting.
Risiko 3 — Query Lambat

Query dashboard dan laporan dapat lambat jika tidak dioptimasi.

Mitigasi:

Gunakan index pada foreign key.
Gunakan pagination.
Gunakan filter wajib.
Hindari select seluruh kolom.
Gunakan view atau materialized view jika diperlukan.
Risiko 4 — Salah Konfigurasi Auth

Redirect URL dan session dapat bermasalah antara lokal dan production.

Mitigasi:

Tambahkan URL lokal dan production di Supabase Auth Redirect URL.
Gunakan cookie-based auth.
Pisahkan konfigurasi development dan production.
Uji login setelah deploy.
Risiko 5 — Tidak Cocok untuk Production Resmi

Vercel Hobby ditujukan untuk personal project dan small-scale application. Untuk sistem akademik resmi universitas, deployment production sebaiknya menggunakan paket berbayar atau infrastruktur institusi.

Mitigasi:

Nyatakan status sistem sebagai MVP/pilot.
Siapkan dokumen upgrade.
Siapkan arsitektur production.
Siapkan backup dan monitoring.
22. Kriteria Keberhasilan MVP

MVP dianggap berhasil jika:

User dapat login sesuai role.
Super Admin dapat mengatur user dan role.
Admin Akademik dapat mengelola data mahasiswa, dosen, mata kuliah, kelas, dan jadwal.
Mahasiswa dapat mengisi dan submit KRS.
Dosen wali atau admin dapat approve/reject KRS.
Dosen dapat input nilai.
Mahasiswa dapat melihat KHS.
Mahasiswa dapat melihat transkrip.
Sistem berhasil dideploy di Vercel.
Data tersimpan di Supabase.
Akses data dibatasi berdasarkan role.
Sistem dapat digunakan untuk demo end-to-end.
23. Roadmap Pengembangan Lanjutan
Versi 1.1
Import data mahasiswa dari CSV.
Export KHS PDF.
Export transkrip PDF.
Dashboard statistik akademik.
Audit log lebih lengkap.
Versi 1.2
Notifikasi email.
Validasi kurikulum.
Prasyarat mata kuliah.
Batas pengambilan mata kuliah berdasarkan IPK.
Manajemen dosen wali.
Versi 2.0
Integrasi pembayaran.
Integrasi SSO kampus.
Integrasi sistem akademik eksternal.
Advanced reporting.
Backup dan restore.
Role permission lebih granular.
Versi Production
Upgrade Vercel Pro atau deploy ke VPS/cloud kampus.
Upgrade Supabase Pro atau managed PostgreSQL.
Setup backup otomatis.
Setup monitoring.
Setup logging.
Setup custom domain.
Setup security review.
Setup load testing.
24. Rekomendasi Akhir

Untuk kebutuhan belajar, portofolio, tugas akhir, atau demo kampus, kombinasi Next.js terbaru, Supabase, dan Vercel Free Tier sangat layak digunakan. Stack ini cepat dikembangkan, mudah dideploy, dan cukup lengkap untuk membangun MVP sistem akademik.

Namun, untuk penggunaan resmi universitas, free tier tidak boleh dianggap sebagai infrastruktur final. Sistem akademik mengandung data sensitif, traffic tinggi pada masa KRS, kebutuhan backup, audit, uptime, dan keamanan yang lebih ketat. Oleh karena itu, MVP ini sebaiknya dirancang dengan struktur yang rapi sejak awal agar mudah dimigrasikan ke paket berbayar atau infrastruktur production.

Kesimpulannya, proyek ini dapat dimulai dengan free deployment sebagai tahap validasi, kemudian ditingkatkan ke arsitektur production setelah fitur utama stabil dan kebutuhan pengguna sudah tervalidasi.