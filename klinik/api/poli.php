<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $query = "SELECT * FROM poli WHERE id_poli = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $poli = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($poli) {
                sendResponse(200, $poli);
            } else {
                sendResponse(404, null, "Poli tidak ditemukan");
            }
        } else {
            $query = "SELECT * FROM poli ORDER BY id_poli";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $poli_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, $poli_list);
        }
        break;

    case 'POST':
        $data = getRequestData();
        if(isset($data->nama_poli)) {
            $query = "INSERT INTO poli (nama_poli, deskripsi, lokasi) VALUES (?, ?, ?)";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([$data->nama_poli, $data->deskripsi, $data->lokasi])) {
                sendResponse(201, ['id' => $db->lastInsertId()], "Poli berhasil ditambahkan");
            } else {
                sendResponse(500, null, "Gagal menambahkan poli");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'PUT':
        $data = getRequestData();
        if(isset($data->id_poli) && isset($data->nama_poli)) {
            $query = "UPDATE poli SET nama_poli=?, deskripsi=?, lokasi=? WHERE id_poli=?";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([$data->nama_poli, $data->deskripsi, $data->lokasi, $data->id_poli])) {
                sendResponse(200, null, "Poli berhasil diupdate");
            } else {
                sendResponse(500, null, "Gagal mengupdate poli");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'DELETE':
        $data = getRequestData();
        if(isset($data->id_poli)) {
            // Check if poli has doctors
            $checkQuery = "SELECT COUNT(*) as total FROM dokter WHERE id_poli = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([$data->id_poli]);
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if($result['total'] > 0) {
                sendResponse(400, null, "Tidak dapat menghapus poli yang masih memiliki dokter");
            } else {
                $query = "DELETE FROM poli WHERE id_poli=?";
                $stmt = $db->prepare($query);
                
                if($stmt->execute([$data->id_poli])) {
                    sendResponse(200, null, "Poli berhasil dihapus");
                } else {
                    sendResponse(500, null, "Gagal menghapus poli");
                }
            }
        } else {
            sendResponse(400, null, "ID poli tidak ditemukan");
        }
        break;

    default:
        sendResponse(405, null, "Method tidak diizinkan");
        break;
}
?>