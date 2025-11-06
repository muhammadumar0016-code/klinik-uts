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
            $query = "SELECT * FROM pasien WHERE id_pasien = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $pasien = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($pasien) {
                sendResponse(200, $pasien);
            } else {
                sendResponse(404, null, "Pasien tidak ditemukan");
            }
        } else {
            $query = "SELECT * FROM pasien ORDER BY id_pasien";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $pasien_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, $pasien_list);
        }
        break;

    case 'POST':
        $data = getRequestData();
        if(isset($data->nama_pasien)) {
            $query = "INSERT INTO pasien (nama_pasien, tanggal_lahir, jenis_kelamin, alamat, no_telepon, email) 
                     VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->nama_pasien, 
                $data->tanggal_lahir, 
                $data->jenis_kelamin, 
                $data->alamat, 
                $data->no_telepon, 
                $data->email
            ])) {
                sendResponse(201, ['id' => $db->lastInsertId()], "Pasien berhasil ditambahkan");
            } else {
                sendResponse(500, null, "Gagal menambahkan pasien");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'PUT':
        $data = getRequestData();
        if(isset($data->id_pasien) && isset($data->nama_pasien)) {
            $query = "UPDATE pasien SET nama_pasien=?, tanggal_lahir=?, jenis_kelamin=?, alamat=?, no_telepon=?, email=?
                     WHERE id_pasien=?";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->nama_pasien, 
                $data->tanggal_lahir, 
                $data->jenis_kelamin, 
                $data->alamat, 
                $data->no_telepon, 
                $data->email,
                $data->id_pasien
            ])) {
                sendResponse(200, null, "Pasien berhasil diupdate");
            } else {
                sendResponse(500, null, "Gagal mengupdate pasien");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'DELETE':
        $data = getRequestData();
        if(isset($data->id_pasien)) {
            // Check if patient has medical records
            $checkQuery = "SELECT COUNT(*) as total FROM rekam_medis WHERE id_pasien = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([$data->id_pasien]);
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if($result['total'] > 0) {
                sendResponse(400, null, "Tidak dapat menghapus pasien yang memiliki rekam medis");
            } else {
                $query = "DELETE FROM pasien WHERE id_pasien=?";
                $stmt = $db->prepare($query);
                
                if($stmt->execute([$data->id_pasien])) {
                    sendResponse(200, null, "Pasien berhasil dihapus");
                } else {
                    sendResponse(500, null, "Gagal menghapus pasien");
                }
            }
        } else {
            sendResponse(400, null, "ID pasien tidak ditemukan");
        }
        break;

    default:
        sendResponse(405, null, "Method tidak diizinkan");
        break;
}
?>