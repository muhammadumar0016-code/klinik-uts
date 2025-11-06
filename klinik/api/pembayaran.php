<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $query = "SELECT pb.*, pd.id_pasien, ps.nama_pasien, d.nama_dokter
                     FROM pembayaran pb
                     JOIN pendaftaran pd ON pb.id_pendaftaran = pd.id_pendaftaran
                     JOIN pasien ps ON pd.id_pasien = ps.id_pasien
                     JOIN dokter d ON pd.id_dokter = d.id_dokter
                     WHERE pb.id_pembayaran = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $pembayaran = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($pembayaran) {
                sendResponse(200, $pembayaran);
            } else {
                sendResponse(404, null, "Pembayaran tidak ditemukan");
            }
        } else {
            $query = "SELECT pb.*, ps.nama_pasien, d.nama_dokter
                     FROM pembayaran pb
                     JOIN pendaftaran pd ON pb.id_pendaftaran = pd.id_pendaftaran
                     JOIN pasien ps ON pd.id_pasien = ps.id_pasien
                     JOIN dokter d ON pd.id_dokter = d.id_dokter
                     ORDER BY pb.tanggal_bayar DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $pembayaran_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, $pembayaran_list);
        }
        break;

    case 'POST':
        $data = getRequestData();
        if(isset($data->id_pendaftaran)) {
            // Calculate total from rekam medis and resep
            $total_biaya = 0;
            $biaya_dokter = $data->biaya_dokter ?? 0;
            $biaya_tindakan = $data->biaya_tindakan ?? 0;
            $biaya_obat = 0;
            
            // Calculate obat cost from resep
            if(isset($data->id_rekam_medis)) {
                $obatQuery = "SELECT SUM(r.jumlah * o.harga) as total_obat 
                             FROM resep r 
                             JOIN obat o ON r.id_obat = o.id_obat 
                             WHERE r.id_rekam_medis = ?";
                $obatStmt = $db->prepare($obatQuery);
                $obatStmt->execute([$data->id_rekam_medis]);
                $obatResult = $obatStmt->fetch(PDO::FETCH_ASSOC);
                $biaya_obat = $obatResult['total_obat'] ?? 0;
            }
            
            $total_biaya = $biaya_dokter + $biaya_tindakan + $biaya_obat;
            
            $query = "INSERT INTO pembayaran (id_pendaftaran, total_biaya, biaya_dokter, biaya_obat, biaya_tindakan, status_bayar, tanggal_bayar) 
                     VALUES (?, ?, ?, ?, ?, 'Lunas', NOW())";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->id_pendaftaran, 
                $total_biaya, 
                $biaya_dokter, 
                $biaya_obat, 
                $biaya_tindakan
            ])) {
                sendResponse(201, ['id' => $db->lastInsertId()], "Pembayaran berhasil disimpan");
            } else {
                sendResponse(500, null, "Gagal menyimpan pembayaran");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    default:
        sendResponse(405, null, "Method tidak diizinkan");
        break;
}
?>