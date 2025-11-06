<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization");

include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = getRequestData();
    
    if(isset($data->username) && isset($data->password)) {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT * FROM staf WHERE username = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$data->username]);
        
        if($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if(md5($data->password) === $user['password']) {
                sendResponse(200, [
                    'id' => $user['id_staf'],
                    'nama' => $user['nama_staf'],
                    'jabatan' => $user['jabatan'],
                    'username' => $user['username']
                ], "Login berhasil");
            } else {
                sendResponse(401, null, "Password salah");
            }
        } else {
            sendResponse(404, null, "User tidak ditemukan");
        }
    } else {
        sendResponse(400, null, "Data tidak lengkap");
    }
} else {
    sendResponse(405, null, "Method tidak diizinkan");
}
?>