<?php
header('Content-Type: application/json');

// Ambil input dari permintaan POST
$data = json_decode(file_get_contents("php://input"), true);

// Debugging: Log data yang diterima
file_put_contents('log.txt', print_r($data, true));

// Periksa apakah data yang diperlukan ada
if (isset($data['data']['daerah']) && isset($data['data']['status']) && isset($data['data']['item'])) {
    $daerah = $data['data']['daerah'];
    $status = $data['data']['status'];
    $item = $data['data']['item'];

    // Tentukan path file JSON untuk incomplete dan complete
    $incompleteFilePath = 'data/incomplete.json';
    $completeFilePath = 'data/complete.json';
    $baseDataFilePath = 'data/data.json';

    // Buat file JSON jika belum ada
    if (!file_exists($incompleteFilePath)) {
        // Kloning dari data.json ke incomplete.json
        copy($baseDataFilePath, $incompleteFilePath);
    }

    if (!file_exists($completeFilePath)) {
        // Buat file complete.json jika belum ada
        file_put_contents($completeFilePath, json_encode([], JSON_PRETTY_PRINT));
    }

    // Ambil konten dari file JSON untuk incomplete dan complete
    $incompleteData = json_decode(file_get_contents($incompleteFilePath), true);
    $completeData = json_decode(file_get_contents($completeFilePath), true);

    // Cek status dan update data sesuai permintaan
    if ($status === 'completed') {
        if (isset($incompleteData[$daerah][$item])) {
            // Pindahkan item dari incomplete ke complete
            $completeData[$daerah][$item] = $incompleteData[$daerah][$item];
            unset($incompleteData[$daerah][$item]);

            // Hapus daerah jika kosong
            if (empty($incompleteData[$daerah])) {
                unset($incompleteData[$daerah]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Item tidak ditemukan di incomplete']);
            exit;
        }
    } elseif ($status === 'incomplete') {
        if (isset($completeData[$daerah][$item])) {
            // Pindahkan item dari complete ke incomplete
            $incompleteData[$daerah][$item] = $completeData[$daerah][$item];
            unset($completeData[$daerah][$item]);

            // Hapus daerah jika kosong
            if (empty($completeData[$daerah])) {
                unset($completeData[$daerah]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Item tidak ditemukan di complete']);
            exit;
        }
    }

    // Simpan perubahan ke file JSON
    file_put_contents($incompleteFilePath, json_encode($incompleteData, JSON_PRETTY_PRINT));
    file_put_contents($completeFilePath, json_encode($completeData, JSON_PRETTY_PRINT));

    // Kirim respons sukses dengan status terbaru
    echo json_encode([
        'success' => true, 
        'message' => 'Status updated successfully',
        'currentStatus' => $status === 'completed' ? 'incomplete' : 'completed'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
}
