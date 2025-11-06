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
            $query = "SELECT pd.*, ps.nama_pasien, d.nama_dokter, p.nama_poli 
                     FROM pendaftaran pd
                     JOIN pasien ps ON pd.id_pasien = ps.id_pasien
                     JOIN dokter d ON pd.id_dokter = d.id_dokter
                     JOIN poli p ON pd.id_poli = p.id_poli
                     WHERE pd.id_pendaftaran = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$_GET['id']]);
            $pendaftaran = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($pendaftaran) {
                sendResponse(200, $pendaftaran);
            } else {
                sendResponse(404, null, "Pendaftaran tidak ditemukan");
            }
        } else {
            $query = "SELECT pd.*, ps.nama_pasien, d.nama_dokter, p.nama_poli 
                     FROM pendaftaran pd
                     JOIN pasien ps ON pd.id_pasien = ps.id_pasien
                     JOIN dokter d ON pd.id_dokter = d.id_dokter
                     JOIN poli p ON pd.id_poli = p.id_poli
                     ORDER BY pd.tanggal_daftar DESC, pd.jam_daftar DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $pendaftaran_list = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, $pendaftaran_list);
        }
        break;

    case 'POST':
        $data = getRequestData();
        if(isset($data->id_pasien) && isset($data->id_dokter) && isset($data->id_poli)) {
            $query = "INSERT INTO pendaftaran (id_pasien, id_dokter, id_poli, tanggal_daftar, jam_daftar, keluhan, status) 
                     VALUES (?, ?, ?, ?, ?, ?, 'Menunggu')";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([
                $data->id_pasien, 
                $data->id_dokter, 
                $data->id_poli, 
                $data->tanggal_daftar, 
                $data->jam_daftar, 
                $data->keluhan
            ])) {
                sendResponse(201, ['id' => $db->lastInsertId()], "Pendaftaran berhasil");
            } else {
                sendResponse(500, null, "Gagal melakukan pendaftaran");
            }
        } else {
            sendResponse(400, null, "Data tidak lengkap");
        }
        break;

    case 'PUT':
        $data = getRequestData();
        if(isset($data->id_pendaftaran) && isset($data->status)) {
            $query = "UPDATE pendaftaran SET status = ? WHERE id_pendaftaran = ?";
            $stmt = $db->prepare($query);
            
            if($stmt->execute([$data->status, $data->id_pendaftaran])) {
                sendResponse(200, null, "Status pendaftaran berhasil diupdate");
            } else {
                sendResponse(500, null, "Gagal mengupdate status");
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