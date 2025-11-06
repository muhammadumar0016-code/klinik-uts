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
            $query = "SELECT d.*, p.nama_poli FROM dokter d 
                     LEFT JOIN poli p ON d.id_poli = p.id_poli 
                     WHERE d.id_dokter = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $dokter = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($dokter) {
                sendResponse(200, $dokter);
            } else {
                sendResponse(404, null, "Dokter tidak ditemukan");
            }
        } else {
            $query = "SELECT d.*, p.nama_poli FROM dokter d 
                     LEFT JOIN poli p ON d.id_poli = p.id_poli 
                     ORDER BY d.id_dokter";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $dokter_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, $dokter_list);
        }
        break;

    case 'POST':
        $data = getRequestData();
        if(isset($data->nama_dokter) && isset($data->id_poli)) {
            $query = "INSERT INTO dokter (id_poli, nama_dokter, spesialisasi, no_telepon, email) 
                     VALUES (?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->id_poli, 
                $data->nama_dokter, 
                $data->spesialisasi, 
                $data->no_telepon, 
                $data->email
            ])) {
                sendResponse(201, ['id' => $db->lastInsertId()], "Dokter berhasil ditambahkan");
            } else {
                sendResponse(500, null, "Gagal menambahkan dokter");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'PUT':
        $data = getRequestData();
        if(isset($data->id_dokter) && isset($data->nama_dokter)) {
            $query = "UPDATE dokter SET id_poli=?, nama_dokter=?, spesialisasi=?, no_telepon=?, email=? 
                     WHERE id_dokter=?";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->id_poli, 
                $data->nama_dokter, 
                $data->spesialisasi, 
                $data->no_telepon, 
                $data->email,
                $data->id_dokter
            ])) {
                sendResponse(200, null, "Dokter berhasil diupdate");
            } else {
                sendResponse(500, null, "Gagal mengupdate dokter");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'DELETE':
        $data = getRequestData();
        if(isset($data->id_dokter)) {
            $query = "DELETE FROM dokter WHERE id_dokter=?";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([$data->id_dokter])) {
                sendResponse(200, null, "Dokter berhasil dihapus");
            } else {
                sendResponse(500, null, "Gagal menghapus dokter");
            }
        } else {
            sendResponse(400, null, "ID dokter tidak ditemukan");
        }
        break;

    default:
        sendResponse(405, null, "Method tidak diizinkan");
        break;
}
?>