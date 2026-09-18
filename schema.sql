-- ==========================================================
-- SKEMA DATABASE MYSQL: FESTIVAL BAND PELAJAR
-- Aplikasi Penjurian Real-Time & Rekapitulasi Skor Otomatis
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `festival_band_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `festival_band_db`;

-- 1. Tabel Konfigurasi Festival
CREATE TABLE IF NOT EXISTS `festival_config` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `festival_name` VARCHAR(255) NOT NULL DEFAULT 'Festival Band Pelajar Tingkat SMA/SMK',
  `edition` VARCHAR(100) NOT NULL DEFAULT 'Tahun 2026',
  `location` VARCHAR(255) NOT NULL DEFAULT 'Auditorium Seni Budaya Pelajar',
  `event_date` VARCHAR(100) NOT NULL DEFAULT '18 September 2026',
  `ketua_panitia` VARCHAR(150) NOT NULL DEFAULT 'Drs. H. Mulyadi, M.Pd.',
  `bobot_musikalitas` INT NOT NULL DEFAULT 30,
  `bobot_teknik` INT NOT NULL DEFAULT 30,
  `bobot_kekompakan` INT NOT NULL DEFAULT 20,
  `bobot_vokal` INT NOT NULL DEFAULT 20,
  `juri_1_name` VARCHAR(150) NOT NULL DEFAULT 'Indra Lesmana, M.Mus.',
  `juri_1_title` VARCHAR(150) NOT NULL DEFAULT 'Komponis & Penata Musik Nasional',
  `juri_2_name` VARCHAR(150) NOT NULL DEFAULT 'Tohpati Ario, S.Sn.',
  `juri_2_title` VARCHAR(150) NOT NULL DEFAULT 'Gitaris & Produser Musik',
  `juri_3_name` VARCHAR(150) NOT NULL DEFAULT 'Kikan Namara',
  `juri_3_title` VARCHAR(150) NOT NULL DEFAULT 'Vokalis & Praktisi Panggung',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabel Pengguna (Admin & Dewan Juri)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `role` ENUM('admin', 'juri_1', 'juri_2', 'juri_3') NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `pin` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Peserta Band
CREATE TABLE IF NOT EXISTS `bands` (
  `id` VARCHAR(50) PRIMARY KEY,
  `nomor_urut` INT NOT NULL UNIQUE,
  `nama_band` VARCHAR(150) NOT NULL,
  `asal_sekolah` VARCHAR(200) NOT NULL,
  `lagu_wajib` VARCHAR(200) NOT NULL,
  `lagu_pilihan` VARCHAR(200) NOT NULL,
  `status` ENUM('menunggu', 'tampil', 'selesai') DEFAULT 'menunggu',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Tabel Personel Band (Gitar, Bass, Drum, Keyboard, Vokal)
CREATE TABLE IF NOT EXISTS `personel` (
  `band_id` VARCHAR(50) PRIMARY KEY,
  `vokal` VARCHAR(150) NOT NULL,
  `gitar` VARCHAR(150) NOT NULL,
  `bass` VARCHAR(150) NOT NULL,
  `drum` VARCHAR(150) NOT NULL,
  `keyboard` VARCHAR(150) NOT NULL,
  FOREIGN KEY (`band_id`) REFERENCES `bands`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Penilaian Dewan Juri
CREATE TABLE IF NOT EXISTS `scores` (
  `id` VARCHAR(80) PRIMARY KEY,
  `band_id` VARCHAR(50) NOT NULL,
  `juri_id` ENUM('juri_1', 'juri_2', 'juri_3') NOT NULL,
  -- Nilai Kriteria Band (10 - 100)
  `musikalitas` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `teknik` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `kekompakan` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `vokal` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `total_band` DECIMAL(6,2) NOT NULL DEFAULT 75.00,
  -- Nilai Kategori Best Player (10 - 100)
  `score_gitar` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `score_bass` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `score_drum` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `score_keyboard` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `score_vokal` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  `catatan` TEXT,
  `is_locked` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_band_juri` (`band_id`, `juri_id`),
  FOREIGN KEY (`band_id`) REFERENCES `bands`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- DATA AWAL (SEED DATA DEFAULT)
-- ==========================================================

-- Data Akun Default:
INSERT INTO `users` (`id`, `username`, `role`, `name`, `title`, `pin`) VALUES
('user_admin', 'admin', 'admin', 'Administrator Panitia', 'Ketua Pelaksana Lomba', 'admin123'),
('user_juri_1', 'juri1', 'juri_1', 'Indra Lesmana, M.Mus.', 'Dewan Juri 1 (Musikalitas & Harmoni)', '1111'),
('user_juri_2', 'juri2', 'juri_2', 'Tohpati Ario, S.Sn.', 'Dewan Juri 2 (Teknik & Skill Instrumen)', '2222'),
('user_juri_3', 'juri3', 'juri_3', 'Kikan Namara', 'Dewan Juri 3 (Performance & Vokal)', '3333')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `festival_config` (`id`, `festival_name`, `edition`, `location`, `event_date`, `ketua_panitia`) VALUES
(1, 'Festival Band Pelajar SMA/SMK se-Derajat', 'Grand Final 2026', 'Auditorium Graha Seni Pemuda', '18 September 2026', 'Drs. H. Mulyadi, M.Pd.')
ON DUPLICATE KEY UPDATE `festival_name` = VALUES(`festival_name`);

-- Data Peserta Band Contoh
INSERT INTO `bands` (`id`, `nomor_urut`, `nama_band`, `asal_sekolah`, `lagu_wajib`, `lagu_pilihan`, `status`) VALUES
('band-01', 1, 'The Highschool Grooves', 'SMA Negeri 1 Garuda', 'Bendera - Cokelat', 'Rumah Kita - God Bless', 'selesai'),
('band-02', 2, 'Neo Acoustic Vibes', 'SMA Negeri 3 Cendekia', 'Kebyar-Kebyar - Gombloh', 'Dan - Sheila on 7', 'selesai'),
('band-03', 3, 'Rock Harmony Society', 'SMK Taruna Nusantara', 'Jadilah Legenda - SID', 'Melompat Lebih Tinggi - SO7', 'tampil'),
('band-04', 4, 'Symphony Muda Nusantara', 'SMA Bina Bangsa Mandiri', 'Bendera - Cokelat', 'Kemesraan - Iwan Fals', 'menunggu'),
('band-05', 5, 'Electric Horizon Band', 'SMA Negeri 5 Prestasi', 'Kebyar-Kebyar - Gombloh', 'Beraksi - Kotak', 'menunggu'),
('band-06', 6, 'Rhythm of Youth', 'SMK Grafika Kreatif', 'Jadilah Legenda - SID', 'Sobat - Padi', 'menunggu'),
('band-07', 7, 'Midnight Serenade', 'SMA Katolik St. Antonius', 'Bendera - Cokelat', 'Panggung Sandiwara - God Bless', 'menunggu'),
('band-08', 8, 'Overdrive Symphony', 'SMA Negeri 8 Metro', 'Kebyar-Kebyar - Gombloh', 'Hampa Musik - Gigi', 'menunggu')
ON DUPLICATE KEY UPDATE `nama_band` = VALUES(`nama_band`);

INSERT INTO `personel` (`band_id`, `vokal`, `gitar`, `bass`, `drum`, `keyboard`) VALUES
('band-01', 'Rian Ardiansyah', 'Dimas Anggara', 'Farhan Ramadhan', 'Gilang Pratama', 'Alifia Nurul'),
('band-02', 'Nadya Putri', 'Kevin Sanjaya', 'Reza Kurnia', 'Bagas Wicaksono', 'Chelsea Olivia'),
('band-03', 'Fajar Nugroho', 'Aditya Pratama', 'Doni Setiawan', 'Rizky Febrian', 'Clarissa Tan'),
('band-04', 'Syifa Azzahra', 'Rendy Pandugo', 'Haikal Kamil', 'Zulfikar Ali', 'Vanessa Bella'),
('band-05', 'Bima Sakti', 'Arya Wiguna', 'Denny Sumargo', 'Taufik Hidayat', 'Zahra Amalia'),
('band-06', 'Daffa Wardhana', 'Rafi Ahmad', 'Aldi Taher', 'Bimo Putro', 'Tiara Andini'),
('band-07', 'Gaby Angelia', 'Nathaniel Joe', 'Christian Sugiono', 'Mario Ginanjar', 'Audrey Tapiheru'),
('band-08', 'Revi Mariska', 'Dicky Chandra', 'Eko Patrio', 'Sandy Pas Band', 'Yovie Widianto Jr.')
ON DUPLICATE KEY UPDATE `vokal` = VALUES(`vokal`);

-- Contoh Nilai Masuk
INSERT INTO `scores` (`id`, `band_id`, `juri_id`, `musikalitas`, `teknik`, `kekompakan`, `vokal`, `total_band`, `score_gitar`, `score_bass`, `score_drum`, `score_keyboard`, `score_vokal`, `catatan`, `is_locked`) VALUES
('sc_b1_j1', 'band-01', 'juri_1', 88.00, 87.00, 89.00, 86.00, 87.50, 89.00, 86.00, 88.00, 87.00, 88.00, 'Aransemen sangat rapi, transisi dinamika lagu wajib sangat dinamis.', 1),
('sc_b1_j2', 'band-01', 'juri_2', 86.00, 88.00, 87.00, 85.00, 86.70, 91.00, 85.00, 89.00, 86.00, 87.00, 'Solo melodi gitar luar biasa bersih dan ekspresif. Tempo drum sangat stabil.', 1),
('sc_b1_j3', 'band-01', 'juri_3', 90.00, 86.00, 92.00, 88.00, 88.80, 88.00, 87.00, 87.00, 88.00, 90.00, 'Penguasaan panggung mengagumkan! Penonton sangat terbawa suasana.', 1),

('sc_b2_j1', 'band-02', 'juri_1', 92.00, 90.00, 88.00, 91.00, 90.40, 88.00, 90.00, 86.00, 93.00, 92.00, 'Sentuhan keyboard dan harmonisasi akor sangat mewah. Nuansa akustiknya hidup.', 1),
('sc_b2_j2', 'band-02', 'juri_2', 90.00, 92.00, 89.00, 90.00, 90.40, 89.00, 92.00, 87.00, 94.00, 91.00, 'Bassis memiliki groove yang matang. Keyboardist luar biasa dalam voicing jazz/pop.', 1),
('sc_b2_j3', 'band-02', 'juri_3', 89.00, 89.00, 90.00, 94.00, 90.20, 87.00, 89.00, 88.00, 92.00, 95.00, 'Artikulasi vokal jernih, penghayatan lirik sangat menyentuh hati dewan juri.', 1),

('sc_b3_j1', 'band-03', 'juri_1', 84.00, 85.00, 86.00, 83.00, 84.50, 85.00, 84.00, 92.00, 82.00, 84.00, 'Pukulan drum enerjik dan bertenaga rock sejati.', 1),
('sc_b3_j2', 'band-03', 'juri_2', 85.00, 86.00, 88.00, 84.00, 85.70, 86.00, 85.00, 94.00, 83.00, 85.00, 'Drummer memiliki stamina dan teknik double pedal yang sangat rapi.', 1),
('sc_b3_j3', 'band-03', 'juri_3', 86.00, 85.00, 87.00, 85.00, 85.70, 85.00, 85.00, 91.00, 84.00, 86.00, 'Aksi panggung rock yang solid dan penuh semangat!', 0)
ON DUPLICATE KEY UPDATE `musikalitas` = VALUES(`musikalitas`);
