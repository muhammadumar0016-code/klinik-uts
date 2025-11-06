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
            $query = "SELECT rm.*, ps.nama_pasien, d.nama_dokter, pd.tanggal_daftar
                     FROM rekam_medis rm
                     JOIN pasien ps ON rm.id_pasien = ps.id_pasien
                     JOIN dokter d ON rm.id_dokter = d.id_dokter
                     JOIN pendaftaran pd ON rm.id_pendaftaran = pd.id_pendaftaran
                     WHERE rm.id_rekam_medis = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $rekam_medis = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($rekam_medis) {
                // Get resep details
                $resepQuery = "SELECT r.*, o.nama_obat, o.harga 
                              FROM resep r 
                              JOIN obat o ON r.id_obat = o.id_obat 
                              WHERE r.id_rekam_medis = ?";
                $resepStmt = $db->prepare($resepQuery);
                $resepStmt->execute([$_GET['id']]);
                $resep = $resepStmt->fetchAll(PDO::FETCH_ASSOC);
                
                $rekam_medis['resep_detail'] = $resep;
                sendResponse(200, $rekam_medis);
            } else {
                sendResponse(404, null, "Rekam medis tidak ditemukan");
            }
        } else {
            $query = "SELECT rm.*, ps.nama_pasien, d.nama_dokter, pd.tanggal_daftar
                     FROM rekam_medis rm
                     JOIN pasien ps ON rm.id_pasien = ps.id_pasien
                     JOIN dokter d ON rm.id_dokter = d.id_dokter
                     JOIN pendaftaran pd ON rm.id_pendaftaran = pd.id_pendaftaran
                     ORDER BY rm.tanggal_periksa DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $rekam_medis_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, $rekam_medis_list);
        }
        break;

    case 'POST':
        $data = getRequestData();
        if(isset($data->id_pendaftaran) && isset($data->id_pasien) && isset($data->id_dokter)) {
            // Start transaction
            $db->beginTransaction();
            
            try {
                // Insert rekam medis
                $query = "INSERT INTO rekam_medis (id_pendaftaran, id_pasien, id_dokter, diagnosa, tindakan, resep_obat, tanggal_periksa) 
                         VALUES (?, ?, ?, ?, ?, ?, NOW())";
                $stmt = $db->prepare($query);
                $stmt->execute([
                    $data->id_pendaftaran, 
                    $data->id_pasien, 
                    $data->id_dokter, 
                    $data->diagnosa, 
                    $data->tindakan, 
                    $data->resep_obat
                ]);
                
                $id_rekam_medis = $db->lastInsertId();
                
                // Update status pendaftaran to 'Selesai'
                $updateQuery = "UPDATE pendaftaran SET status = 'Selesai' WHERE id_pendaftaran = ?";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([$data->id_pendaftaran]);
                
                // Insert resep if exists
                if(isset($data->resep_detail) && is_array($data->resep_detail)) {
                    foreach($data->resep_detail as $resep) {
                        $resepQuery = "INSERT INTO resep (id_rekam_medis, id_obat, jumlah, aturan_pakai) 
                                     VALUES (?, ?, ?, ?)";
                        $resepStmt = $db->prepare($resepQuery);
                        $resepStmt->execute([
                            $id_rekam_medis,
                            $resep->id_obat,
                            $resep->jumlah,
                            $resep->aturan_pakai
                        ]);
                        
                        // Update stok obat
                        $updateObatQuery = "UPDATE obat SET stok = stok - ? WHERE id_obat = ?";
                        $updateObatStmt = $db->prepare($updateObatQuery);
                        $updateObatStmt->execute([$resep->jumlah, $resep->id_obat]);
                    }
                }
                
                $db->commit();
                sendResponse(201, ['id' => $id_rekam_medis], "Rekam medis berhasil disimpan");
                
            } catch(Exception $e) {
                $db->rollBack();
                sendResponse(500, null, "Gagal menyimpan rekam medis: " . $e->getMessage());
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