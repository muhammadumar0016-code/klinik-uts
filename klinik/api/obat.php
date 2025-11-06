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
            $query = "SELECT * FROM obat WHERE id_obat = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $obat = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($obat) {
                sendResponse(200, $obat);
            } else {
                sendResponse(404, null, "Obat tidak ditemukan");
            }
        } else {
            $query = "SELECT * FROM obat ORDER BY nama_obat";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $obat_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, $obat_list);
        }
        break;

    case 'POST':
        $data = getRequestData();
        if(isset($data->nama_obat)) {
            $query = "INSERT INTO obat (nama_obat, jenis_obat, stok, harga, satuan) 
                     VALUES (?, ?, ?, ?, ?)";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->nama_obat, 
                $data->jenis_obat, 
                $data->stok, 
                $data->harga, 
                $data->satuan
            ])) {
                sendResponse(201, ['id' => $db->lastInsertId()], "Obat berhasil ditambahkan");
            } else {
                sendResponse(500, null, "Gagal menambahkan obat");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'PUT':
        $data = getRequestData();
        if(isset($data->id_obat) && isset($data->nama_obat)) {
            $query = "UPDATE obat SET nama_obat=?, jenis_obat=?, stok=?, harga=?, satuan=?
                     WHERE id_obat=?";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->nama_obat, 
                $data->jenis_obat, 
                $data->stok, 
                $data->harga, 
                $data->satuan,
                $data->id_obat
            ])) {
                sendResponse(200, null, "Obat berhasil diupdate");
            } else {
                sendResponse(500, null, "Gagal mengupdate obat");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'DELETE':
        $data = getRequestData();
        if(isset($data->id_obat)) {
            // Check if obat is used in resep
            $checkQuery = "SELECT COUNT(*) as total FROM resep WHERE id_obat = ?";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([$data->id_obat]);
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if($result['total'] > 0) {
                sendResponse(400, null, "Tidak dapat menghapus obat yang sudah digunakan dalam resep");
            } else {
                $query = "DELETE FROM obat WHERE id_obat=?";
                $stmt = $db->prepare($query);
                
                if($stmt->execute([$data->id_obat])) {
                    sendResponse(200, null, "Obat berhasil dihapus");
                } else {
                    sendResponse(500, null, "Gagal menghapus obat");
                }
            }
        } else {
            sendResponse(400, null, "ID obat tidak ditemukan");
        }
        break;

    default:
        sendResponse(405, null, "Method tidak diizinkan");
        break;
}
?>