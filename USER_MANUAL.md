# User Manual SIAKAD

## 1. Ringkasan

SIAKAD adalah sistem akademik berbasis web untuk mengelola data akademik, KRS, nilai, KHS, dan program KKN/TA/KP. Sistem memakai akses berbasis role, sehingga menu yang tampil mengikuti hak akses akun.

## 2. Login

1. Buka aplikasi.
2. Pilih akun demo dari dropdown Akun Demo, atau isi email dan password manual.
3. Klik Masuk.
4. Sistem mengarahkan pengguna ke halaman sesuai role.

Password akun demo:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@siakad.demo` | `password123` |
| Admin Akademik | `akademik@siakad.demo` | `password123` |
| Ketua Program Studi | `kaprodi@siakad.demo` | `password123` |
| Dosen | `dosen@siakad.demo` | `password123` |
| Mahasiswa | `mahasiswa@siakad.demo` | `password123` |

Jika login demo gagal setelah reset database, administrator perlu menjalankan ulang `supabase/seed.sql` setelah migration.

## 3. Role dan Menu

| Role | Menu |
| --- | --- |
| Super Admin | Dashboard, Fakultas, Program Studi, Mahasiswa, Dosen, Mata Kuliah, Kelas, Jadwal, KRS, KKN/TA/KP, Nilai, KHS, Pengaturan |
| Admin Akademik | Dashboard, Program Studi, Mahasiswa, Dosen, Mata Kuliah, Kelas, Jadwal, KRS, KKN/TA/KP, Nilai, KHS, Pengaturan |
| Ketua Program Studi | Dashboard, Mahasiswa, Dosen, Kelas, KKN/TA/KP |
| Dosen | Dashboard, Validasi KRS, Nilai, KKN/TA/KP |
| Mahasiswa | Dashboard, KRS, KKN/TA/KP, KHS |

## 4. Dashboard

Dashboard menampilkan ringkasan sesuai role:

- Super Admin dan Admin Akademik melihat jumlah mahasiswa, dosen, mata kuliah, dan KRS pending.
- Ketua Program Studi melihat data mahasiswa, dosen, dan kelas di lingkup prodi.
- Dosen melihat jumlah KRS yang perlu divalidasi.
- Mahasiswa melihat ringkasan KRS dan KHS.

Gunakan Akses Cepat untuk masuk ke modul utama role.

## 5. Data Master

### Fakultas

Akses: Super Admin.

Langkah tambah fakultas:

1. Buka Fakultas.
2. Klik Tambah Fakultas.
3. Isi Kode dan Nama.
4. Klik Simpan.

### Program Studi

Akses: Super Admin, Admin Akademik.

Langkah tambah program studi:

1. Buka Program Studi.
2. Klik Tambah Prodi.
3. Pilih Fakultas.
4. Isi Kode, Nama, dan Jenjang.
5. Klik Simpan.

### Pengaturan

Akses: Super Admin, Admin Akademik.

Tab tersedia:

- Tahun Akademik: tambah label tahun, contoh `2025/2026`, lalu centang Aktif jika dipakai.
- Semester: pilih tahun akademik, isi nama, nomor semester 1 sampai 3, lalu centang Aktif jika dipakai.
- Ruangan: isi kode, nama, gedung, dan kapasitas.

Jika satu tahun akademik atau semester dibuat Aktif, data aktif lama otomatis dinonaktifkan.

## 6. Mahasiswa dan Dosen

### Mahasiswa

Akses: Super Admin, Admin Akademik, Ketua Program Studi.

Langkah tambah mahasiswa:

1. Buka Mahasiswa.
2. Klik Tambah Mahasiswa.
3. Pilih akun pengguna ber-role Mahasiswa yang belum terhubung.
4. Isi NIM.
5. Pilih Program Studi.
6. Isi Angkatan.
7. Klik Simpan.

### Dosen

Akses: Super Admin, Admin Akademik, Ketua Program Studi.

Langkah tambah dosen:

1. Buka Dosen.
2. Klik Tambah Dosen.
3. Pilih akun pengguna ber-role Dosen yang belum terhubung.
4. Isi NIDN.
5. Pilih Program Studi.
6. Isi Keahlian jika ada.
7. Klik Simpan.

## 7. Mata Kuliah, Kelas, Jadwal

### Mata Kuliah

Akses: Super Admin, Admin Akademik.

Langkah tambah mata kuliah:

1. Buka Mata Kuliah.
2. Klik Tambah Mata Kuliah.
3. Isi Kode, Nama, SKS, dan Semester rekomendasi.
4. Pilih Program Studi.
5. Klik Simpan.

### Kelas

Akses: Super Admin, Admin Akademik, Ketua Program Studi.

Langkah tambah kelas:

1. Buka Kelas.
2. Klik Tambah Kelas.
3. Isi Nama Kelas.
4. Pilih Mata Kuliah.
5. Pilih Dosen.
6. Pilih Tahun Akademik dan Semester.
7. Isi Kapasitas.
8. Klik Simpan.

Kelas baru berstatus `open`.

### Jadwal Kuliah

Akses: Super Admin, Admin Akademik.

Langkah tambah jadwal:

1. Buka Jadwal.
2. Klik Tambah Jadwal.
3. Pilih Kelas.
4. Pilih Hari dan Ruangan.
5. Isi jam Mulai dan Selesai.
6. Klik Simpan.

Sistem menolak jadwal jika kelas, ruangan, atau waktu bentrok menurut validasi server.

## 8. KRS

### Mahasiswa Mengisi KRS

Akses: Mahasiswa.

Langkah isi KRS:

1. Buka KRS.
2. Pastikan status masih Draft.
3. Pada Kelas Tersedia, klik Pilih untuk mata kuliah yang ingin diambil.
4. Cek daftar Mata Kuliah Dipilih dan total SKS.
5. Klik Hapus jika ingin menghapus kelas.
6. Klik Ajukan KRS setelah pilihan final.

Aturan KRS:

- KRS hanya bisa diubah saat status Draft.
- Batas total SKS adalah 24.
- Mata kuliah sama tidak bisa diambil lebih dari sekali.
- Kelas penuh tidak bisa dipilih.
- Jadwal bentrok tidak bisa dipilih.
- Setelah diajukan, status berubah menjadi Diajukan.

### Validasi KRS

Akses: Super Admin, Admin Akademik, Dosen wali.

Langkah validasi:

1. Admin membuka KRS, atau dosen membuka Validasi KRS.
2. Cari mahasiswa dengan status Diajukan.
3. Klik Setujui untuk menerima KRS.
4. Klik Tolak untuk menolak KRS, lalu isi alasan penolakan.

Status KRS:

- Draft: masih dapat diedit mahasiswa.
- Diajukan: menunggu validasi.
- Disetujui: valid dan dapat dipakai untuk input nilai.
- Ditolak: tidak disetujui.

## 9. Nilai dan KHS

### Input Nilai

Akses: Super Admin, Admin Akademik, Dosen.

Langkah input nilai:

1. Buka Nilai.
2. Pilih kelas.
3. Isi nilai Tugas, UTS, dan UAS untuk setiap mahasiswa.
4. Klik Simpan per mahasiswa.
5. Klik Publikasikan Nilai jika nilai siap dilihat mahasiswa.
6. Admin dapat klik Kunci Nilai untuk mengunci nilai kelas.

Catatan:

- Daftar mahasiswa berasal dari KRS berstatus Disetujui.
- Nilai akhir dan huruf mutu dihitung otomatis.
- Mahasiswa melihat nilai yang sudah dipublikasikan di KHS.

### KHS

Akses: Super Admin, Admin Akademik, Mahasiswa.

KHS menampilkan:

- Mata kuliah, kelas, semester, tahun akademik.
- Nilai numerik, huruf mutu, dan mutu.
- Hasil program KKN/TA/KP jika sudah difinalisasi.

## 10. KKN/TA/KP

Modul KKN/TA/KP dipakai untuk pendaftaran, verifikasi, penugasan dosen, logbook, penilaian, dan finalisasi nilai program akademik.

Jenis program:

- KKN
- Tugas Akhir
- Kerja Praktek

Status pendaftaran:

- Pending
- Disetujui
- Ditolak
- Aktif
- Selesai

### Admin Membuat Periode

Akses: Super Admin, Admin Akademik, Ketua Program Studi.

Langkah:

1. Buka KKN/TA/KP.
2. Pada Periode Baru, isi Nama Periode.
3. Pilih Jenis, Tahun Akademik, Semester, Program Studi, dan Mata Kuliah Transkrip jika diperlukan.
4. Isi tanggal Buka Pendaftaran dan Tutup Pendaftaran.
5. Isi tanggal kegiatan jika ada.
6. Isi Minimal SKS, Minimal IPK, dan Kuota Pembimbing.
7. Pilih Status Periode.
8. Klik Simpan Periode.

### Admin Membuat Rubrik

Akses: Super Admin, Admin Akademik, Ketua Program Studi.

Langkah:

1. Pada Rubrik Penilaian, pilih Periode.
2. Isi Komponen.
3. Pilih Penilai: Pembimbing atau Penguji.
4. Isi Skor Maks, Bobot %, dan Urutan.
5. Klik Simpan Rubrik.

### Mahasiswa Mengajukan Pendaftaran

Akses: Mahasiswa.

Langkah:

1. Buka KKN/TA/KP.
2. Pilih Periode.
3. Isi Judul Proposal dan Ringkasan Proposal.
4. Unggah KRS, Transkrip, dan Draft Proposal.
5. Klik Kirim Pendaftaran.

Format file yang diterima: PDF, JPG, PNG, WEBP.

Sistem memeriksa:

- Periode aktif.
- Tanggal pendaftaran masih terbuka.
- Program studi sesuai.
- Minimal SKS dan IPK terpenuhi.
- Dokumen wajib lengkap.

Jika prasyarat gagal, pendaftaran masuk status Ditolak dengan alasan otomatis.

### Admin Memproses Pendaftaran

Akses: Super Admin, Admin Akademik, Ketua Program Studi.

Langkah:

1. Buka daftar pendaftaran di KKN/TA/KP.
2. Review status, dokumen, SKS, IPK, dan proposal.
3. Klik Setujui, Aktifkan, Selesaikan, atau Tolak.
4. Untuk Tolak, isi alasan penolakan.
5. Pada Penugasan Dosen, pilih dosen.
6. Pilih role Pembimbing atau Penguji.
7. Klik Tugaskan.

Kuota pembimbing dicek per dosen dan periode.

### Mahasiswa Mengisi Logbook

Akses: Mahasiswa.

Logbook hanya bisa diisi jika pendaftaran berstatus Disetujui atau Aktif.

Langkah:

1. Buka KKN/TA/KP.
2. Pada pendaftaran aktif, isi Tanggal.
3. Isi Minggu Ke.
4. Isi Aktivitas.
5. Isi Catatan Progress jika ada.
6. Isi URL Lampiran jika ada.
7. Klik Simpan Logbook.

### Dosen Review Logbook dan Nilai

Akses: Dosen yang ditugaskan, Super Admin, Admin Akademik, Ketua Program Studi.

Langkah review logbook:

1. Buka KKN/TA/KP.
2. Pilih logbook mahasiswa.
3. Pilih status Diterima, Revisi, atau Ditolak.
4. Isi Catatan Review.
5. Klik Review.

Langkah input penilaian:

1. Buka bagian Penilaian.
2. Isi skor sesuai rubrik.
3. Isi catatan jika ada.
4. Klik Simpan.

Dosen hanya bisa menilai rubrik sesuai role penugasan. Admin dan Ketua Program Studi dapat membantu pengisian penilaian.

### Finalisasi Nilai Program

Akses: Super Admin, Admin Akademik, Ketua Program Studi.

Langkah:

1. Pastikan rubrik dan penilaian sudah terisi.
2. Klik Finalisasi Nilai.
3. Sistem menghitung nilai akhir berbobot.
4. Status pendaftaran berubah menjadi Selesai.
5. Nilai tampil di KHS.

## 11. Urutan Setup Data Demo

Gunakan urutan berikut agar fitur berjalan:

1. Login sebagai Super Admin.
2. Buat atau pastikan Fakultas tersedia.
3. Buat Program Studi.
4. Buat Tahun Akademik aktif.
5. Buat Semester aktif.
6. Buat Ruangan.
7. Buat atau pastikan akun dosen dan mahasiswa tersedia di Supabase Auth.
8. Hubungkan akun ke data Dosen dan Mahasiswa.
9. Buat Mata Kuliah.
10. Buat Kelas.
11. Buat Jadwal.
12. Login sebagai Mahasiswa untuk isi KRS.
13. Login sebagai Dosen atau Admin untuk validasi KRS.
14. Login sebagai Dosen untuk input nilai.
15. Publikasikan nilai.
16. Login sebagai Mahasiswa untuk cek KHS.

## 12. Troubleshooting

| Masalah | Penyebab | Tindakan |
| --- | --- | --- |
| Login gagal | Data demo di `public.users` belum ada atau password hash belum dibuat | Jalankan ulang `supabase/seed.sql` |
| Akun tidak aktif | Kolom `profiles.is_active` bernilai false | Aktifkan akun dari database atau fitur admin jika tersedia |
| Mahasiswa tidak muncul di input nilai | KRS belum Disetujui | Validasi KRS terlebih dahulu |
| Kelas tidak bisa dipilih di KRS | Kelas penuh, bentrok, sudah diambil, atau melebihi 24 SKS | Pilih kelas lain atau ubah jadwal |
| Tombol simpan disabled | Field wajib belum dipilih | Lengkapi pilihan dropdown dan input wajib |
| Pendaftaran KKN/TA/KP ditolak otomatis | Minimal SKS/IPK belum terpenuhi | Cek nilai terpublikasi dan syarat periode |
| Upload dokumen gagal | Storage bucket atau file tidak valid | Pastikan bucket tersedia dan file PDF/JPG/PNG/WEBP |

## 13. Batasan MVP

- Sistem fokus pada demo dan operasional akademik dasar.
- Banyak form saat ini fokus tambah data, belum semua data punya edit/delete dari UI.
- Akun baru tetap bergantung pada Supabase Auth.
- Data yang tampil mengikuti Row Level Security dan role pengguna.
- Untuk penggunaan production, perlu audit akses, backup, monitoring, dan kebijakan data kampus.
