-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 06 Nov 2025 pada 17.52
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `klinik`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `dokter`
--

CREATE TABLE `dokter` (
  `id_dokter` int(11) NOT NULL,
  `id_poli` int(11) DEFAULT NULL,
  `nama_dokter` varchar(100) NOT NULL,
  `spesialisasi` varchar(100) DEFAULT NULL,
  `no_telepon` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `dokter`
--

INSERT INTO `dokter` (`id_dokter`, `id_poli`, `nama_dokter`, `spesialisasi`, `no_telepon`, `email`) VALUES
(1, 1, 'Dr. Ahmad Wijaya', 'Dokter Umum', '081234567890', 'ahmad.wijaya@klinik.com'),
(2, 1, 'Dr. Siti Rahayu', 'Dokter Umum', '081234567891', 'siti.rahayu@klinik.com'),
(3, 2, 'Dr. Budi Santoso', 'Dokter Gigi', '081234567892', 'budi.santoso@klinik.com'),
(4, 3, 'Dr. Maria Ulfa', 'Spesialis Anak', '081234567893', 'maria.ulfa@klinik.com'),
(5, 4, 'Dr. Rina Melati', 'Spesialis Kandungan', '081234567894', 'rina.melati@klinik.com'),
(6, 5, 'Dr. Hendra Gunawan', 'Spesialis Bedah', '081234567895', 'hendra.gunawan@klinik.com');

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal_praktek`
--

CREATE TABLE `jadwal_praktek` (
  `id_jadwal` int(11) NOT NULL,
  `id_dokter` int(11) DEFAULT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') DEFAULT NULL,
  `jam_mulai` time DEFAULT NULL,
  `jam_selesai` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `jadwal_praktek`
--

INSERT INTO `jadwal_praktek` (`id_jadwal`, `id_dokter`, `hari`, `jam_mulai`, `jam_selesai`) VALUES
(1, 1, 'Senin', '08:00:00', '12:00:00'),
(2, 1, 'Rabu', '08:00:00', '12:00:00'),
(3, 1, 'Jumat', '08:00:00', '12:00:00'),
(4, 2, 'Selasa', '13:00:00', '17:00:00'),
(5, 2, 'Kamis', '13:00:00', '17:00:00'),
(6, 3, 'Senin', '13:00:00', '17:00:00'),
(7, 3, 'Kamis', '08:00:00', '12:00:00'),
(8, 4, 'Selasa', '08:00:00', '12:00:00'),
(9, 4, 'Jumat', '13:00:00', '17:00:00'),
(10, 5, 'Rabu', '13:00:00', '17:00:00'),
(11, 5, 'Sabtu', '08:00:00', '12:00:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `obat`
--

CREATE TABLE `obat` (
  `id_obat` int(11) NOT NULL,
  `nama_obat` varchar(100) NOT NULL,
  `jenis_obat` varchar(50) DEFAULT NULL,
  `stok` int(11) DEFAULT NULL,
  `harga` decimal(10,2) DEFAULT NULL,
  `satuan` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `obat`
--

INSERT INTO `obat` (`id_obat`, `nama_obat`, `jenis_obat`, `stok`, `harga`, `satuan`) VALUES
(1, 'Paracetamol 500mg', 'Analgesik', 100, 5000.00, 'tablet'),
(2, 'Amoxicillin 500mg', 'Antibiotik', 50, 8000.00, 'kapsul'),
(3, 'Ibuprofen 400mg', 'Anti-inflamasi', 75, 6000.00, 'tablet'),
(4, 'Cetirizine 10mg', 'Antihistamin', 60, 4500.00, 'tablet'),
(5, 'Omeprazole 20mg', 'Antasida', 40, 12000.00, 'kapsul'),
(6, 'Vitamin C 500mg', 'Vitamin', 120, 3000.00, 'tablet');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pasien`
--

CREATE TABLE `pasien` (
  `id_pasien` int(11) NOT NULL,
  `nama_pasien` varchar(100) NOT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `no_telepon` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pasien`
--

INSERT INTO `pasien` (`id_pasien`, `nama_pasien`, `tanggal_lahir`, `jenis_kelamin`, `alamat`, `no_telepon`, `email`) VALUES
(1, 'Budi Pratama', '1985-03-15', 'L', 'Jl. Merdeka No. 123, Jakarta', '08111222333', 'budi.pratama@gmail.com'),
(2, 'Sari Indah', '1990-07-22', 'P', 'Jl. Sudirman No. 45, Jakarta', '08111222334', 'sari.indah@yahoo.com'),
(3, 'Rudi Hermawan', '1978-11-30', 'L', 'Jl. Thamrin No. 67, Jakarta', '08111222335', 'rudi.hermawan@gmail.com'),
(4, 'Dewi Anggraini', '1995-05-10', 'P', 'Jl. Gatot Subroto No. 89, Jakarta', '08111222336', 'dewi.anggraini@yahoo.com'),
(5, 'Ahmad Fauzi', '1982-09-18', 'L', 'Jl. Rasuna Said No. 12, Jakarta', '08111222337', 'ahmad.fauzi@gmail.com'),
(6, 'Maya Sari', '1992-12-25', 'P', 'Jl. HR Rasuna Said No. 34, Jakarta', '08111222338', 'maya.sari@yahoo.com');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pembayaran`
--

CREATE TABLE `pembayaran` (
  `id_pembayaran` int(11) NOT NULL,
  `id_pendaftaran` int(11) DEFAULT NULL,
  `total_biaya` decimal(12,2) DEFAULT NULL,
  `biaya_dokter` decimal(10,2) DEFAULT NULL,
  `biaya_obat` decimal(10,2) DEFAULT NULL,
  `biaya_tindakan` decimal(10,2) DEFAULT NULL,
  `status_bayar` enum('Lunas','Belum Lunas') DEFAULT NULL,
  `tanggal_bayar` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pembayaran`
--

INSERT INTO `pembayaran` (`id_pembayaran`, `id_pendaftaran`, `total_biaya`, `biaya_dokter`, `biaya_obat`, `biaya_tindakan`, `status_bayar`, `tanggal_bayar`) VALUES
(1, 1, 150000.00, 100000.00, 50000.00, 0.00, 'Lunas', '2024-01-15'),
(2, 2, 450000.00, 150000.00, 50000.00, 250000.00, 'Lunas', '2024-01-15');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pendaftaran`
--

CREATE TABLE `pendaftaran` (
  `id_pendaftaran` int(11) NOT NULL,
  `id_pasien` int(11) DEFAULT NULL,
  `id_dokter` int(11) DEFAULT NULL,
  `id_poli` int(11) DEFAULT NULL,
  `tanggal_daftar` date DEFAULT NULL,
  `jam_daftar` time DEFAULT NULL,
  `keluhan` text DEFAULT NULL,
  `status` enum('Menunggu','Proses','Selesai','Batal') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pendaftaran`
--

INSERT INTO `pendaftaran` (`id_pendaftaran`, `id_pasien`, `id_dokter`, `id_poli`, `tanggal_daftar`, `jam_daftar`, `keluhan`, `status`) VALUES
(1, 1, 1, 1, '2024-01-15', '08:30:00', 'Demam dan batuk sudah 3 hari', 'Selesai'),
(2, 2, 3, 2, '2024-01-15', '09:15:00', 'Sakit gigi geraham berlubang', 'Selesai'),
(3, 3, 1, 1, '2024-01-16', '10:00:00', 'Pusing dan mual', 'Proses'),
(4, 4, 4, 3, '2024-01-16', '11:30:00', 'Kontrol kehamilan bulanan', 'Menunggu'),
(5, 5, 5, 4, '2024-01-17', '14:00:00', 'Konsultasi kesehatan kandungan', 'Menunggu'),
(6, 6, 3, 2, '2024-01-17', '15:30:00', 'Pemasangan kawat gigi', 'Proses');

-- --------------------------------------------------------

--
-- Struktur dari tabel `poli`
--

CREATE TABLE `poli` (
  `id_poli` int(11) NOT NULL,
  `nama_poli` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `lokasi` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `poli`
--

INSERT INTO `poli` (`id_poli`, `nama_poli`, `deskripsi`, `lokasi`) VALUES
(1, 'Poli Umum', 'Pelayanan kesehatan umum untuk semua usia', 'Lantai 1 - Ruang 101'),
(2, 'Poli Gigi', 'Perawatan dan pengobatan gigi dan mulut', 'Lantai 1 - Ruang 102'),
(3, 'Poli Anak', 'Pelayanan kesehatan khusus anak-anak', 'Lantai 2 - Ruang 201'),
(4, 'Poli Kandungan', 'Pelayanan kesehatan ibu dan kandungan', 'Lantai 2 - Ruang 202'),
(5, 'Poli Bedah', 'Pelayanan bedah umum dan konsultasi', 'Lantai 3 - Ruang 301');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rekam_medis`
--

CREATE TABLE `rekam_medis` (
  `id_rekam_medis` int(11) NOT NULL,
  `id_pendaftaran` int(11) DEFAULT NULL,
  `id_pasien` int(11) DEFAULT NULL,
  `id_dokter` int(11) DEFAULT NULL,
  `diagnosa` text DEFAULT NULL,
  `tindakan` text DEFAULT NULL,
  `resep_obat` text DEFAULT NULL,
  `tanggal_periksa` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `rekam_medis`
--

INSERT INTO `rekam_medis` (`id_rekam_medis`, `id_pendaftaran`, `id_pasien`, `id_dokter`, `diagnosa`, `tindakan`, `resep_obat`, `tanggal_periksa`) VALUES
(1, 1, 1, 1, 'Influenza', 'Pemeriksaan fisik, pengukuran suhu tubuh', 'Paracetamol 500mg', '2024-01-15 09:00:00'),
(2, 2, 2, 3, 'Karies gigi molar', 'Tambal gigi, pembersihan karang gigi', 'Analgesik untuk nyeri', '2024-01-15 10:00:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `resep`
--

CREATE TABLE `resep` (
  `id_resep` int(11) NOT NULL,
  `id_rekam_medis` int(11) DEFAULT NULL,
  `id_obat` int(11) DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `aturan_pakai` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `resep`
--

INSERT INTO `resep` (`id_resep`, `id_rekam_medis`, `id_obat`, `jumlah`, `aturan_pakai`) VALUES
(1, 1, 1, 10, '3x1 sehari setelah makan'),
(2, 1, 6, 10, '1x1 sehari'),
(3, 2, 1, 5, '3x1 sehari jika sakit'),
(4, 2, 2, 7, '2x1 sehari setelah makan');

-- --------------------------------------------------------

--
-- Struktur dari tabel `staf`
--

CREATE TABLE `staf` (
  `id_staf` int(11) NOT NULL,
  `nama_staf` varchar(100) NOT NULL,
  `jabatan` varchar(50) DEFAULT NULL,
  `no_telepon` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `staf`
--

INSERT INTO `staf` (`id_staf`, `nama_staf`, `jabatan`, `no_telepon`, `email`, `username`, `password`) VALUES
(1, 'Admin Klinik', 'Administrator', '081234567899', 'admin@klinik.com', 'admin', '0192023a7bbd73250516f069df18b500'),
(2, 'Resepsionis 1', 'Resepsionis', '081234567898', 'resepsionis@klinik.com', 'resepsionis', '6a2975278eb89686feebda5a9a9ef70a');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `dokter`
--
ALTER TABLE `dokter`
  ADD PRIMARY KEY (`id_dokter`),
  ADD KEY `id_poli` (`id_poli`);

--
-- Indeks untuk tabel `jadwal_praktek`
--
ALTER TABLE `jadwal_praktek`
  ADD PRIMARY KEY (`id_jadwal`),
  ADD KEY `id_dokter` (`id_dokter`);

--
-- Indeks untuk tabel `obat`
--
ALTER TABLE `obat`
  ADD PRIMARY KEY (`id_obat`);

--
-- Indeks untuk tabel `pasien`
--
ALTER TABLE `pasien`
  ADD PRIMARY KEY (`id_pasien`);

--
-- Indeks untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD PRIMARY KEY (`id_pembayaran`),
  ADD KEY `id_pendaftaran` (`id_pendaftaran`);

--
-- Indeks untuk tabel `pendaftaran`
--
ALTER TABLE `pendaftaran`
  ADD PRIMARY KEY (`id_pendaftaran`),
  ADD KEY `id_pasien` (`id_pasien`),
  ADD KEY `id_dokter` (`id_dokter`),
  ADD KEY `id_poli` (`id_poli`);

--
-- Indeks untuk tabel `poli`
--
ALTER TABLE `poli`
  ADD PRIMARY KEY (`id_poli`);

--
-- Indeks untuk tabel `rekam_medis`
--
ALTER TABLE `rekam_medis`
  ADD PRIMARY KEY (`id_rekam_medis`),
  ADD KEY `id_pendaftaran` (`id_pendaftaran`),
  ADD KEY `id_pasien` (`id_pasien`),
  ADD KEY `id_dokter` (`id_dokter`);

--
-- Indeks untuk tabel `resep`
--
ALTER TABLE `resep`
  ADD PRIMARY KEY (`id_resep`),
  ADD KEY `id_rekam_medis` (`id_rekam_medis`),
  ADD KEY `id_obat` (`id_obat`);

--
-- Indeks untuk tabel `staf`
--
ALTER TABLE `staf`
  ADD PRIMARY KEY (`id_staf`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `dokter`
--
ALTER TABLE `dokter`
  MODIFY `id_dokter` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `jadwal_praktek`
--
ALTER TABLE `jadwal_praktek`
  MODIFY `id_jadwal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `obat`
--
ALTER TABLE `obat`
  MODIFY `id_obat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `pasien`
--
ALTER TABLE `pasien`
  MODIFY `id_pasien` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  MODIFY `id_pembayaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `pendaftaran`
--
ALTER TABLE `pendaftaran`
  MODIFY `id_pendaftaran` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `poli`
--
ALTER TABLE `poli`
  MODIFY `id_poli` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `rekam_medis`
--
ALTER TABLE `rekam_medis`
  MODIFY `id_rekam_medis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `resep`
--
ALTER TABLE `resep`
  MODIFY `id_resep` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `staf`
--
ALTER TABLE `staf`
  MODIFY `id_staf` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `dokter`
--
ALTER TABLE `dokter`
  ADD CONSTRAINT `dokter_ibfk_1` FOREIGN KEY (`id_poli`) REFERENCES `poli` (`id_poli`);

--
-- Ketidakleluasaan untuk tabel `jadwal_praktek`
--
ALTER TABLE `jadwal_praktek`
  ADD CONSTRAINT `jadwal_praktek_ibfk_1` FOREIGN KEY (`id_dokter`) REFERENCES `dokter` (`id_dokter`);

--
-- Ketidakleluasaan untuk tabel `pembayaran`
--
ALTER TABLE `pembayaran`
  ADD CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran` (`id_pendaftaran`);

--
-- Ketidakleluasaan untuk tabel `pendaftaran`
--
ALTER TABLE `pendaftaran`
  ADD CONSTRAINT `pendaftaran_ibfk_1` FOREIGN KEY (`id_pasien`) REFERENCES `pasien` (`id_pasien`),
  ADD CONSTRAINT `pendaftaran_ibfk_2` FOREIGN KEY (`id_dokter`) REFERENCES `dokter` (`id_dokter`),
  ADD CONSTRAINT `pendaftaran_ibfk_3` FOREIGN KEY (`id_poli`) REFERENCES `poli` (`id_poli`);

--
-- Ketidakleluasaan untuk tabel `rekam_medis`
--
ALTER TABLE `rekam_medis`
  ADD CONSTRAINT `rekam_medis_ibfk_1` FOREIGN KEY (`id_pendaftaran`) REFERENCES `pendaftaran` (`id_pendaftaran`),
  ADD CONSTRAINT `rekam_medis_ibfk_2` FOREIGN KEY (`id_pasien`) REFERENCES `pasien` (`id_pasien`),
  ADD CONSTRAINT `rekam_medis_ibfk_3` FOREIGN KEY (`id_dokter`) REFERENCES `dokter` (`id_dokter`);

--
-- Ketidakleluasaan untuk tabel `resep`
--
ALTER TABLE `resep`
  ADD CONSTRAINT `resep_ibfk_1` FOREIGN KEY (`id_rekam_medis`) REFERENCES `rekam_medis` (`id_rekam_medis`),
  ADD CONSTRAINT `resep_ibfk_2` FOREIGN KEY (`id_obat`) REFERENCES `obat` (`id_obat`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
