<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file'];

    // Periksa apakah file adalah JSON
    if ($file['type'] !== 'application/json') {
        echo json_encode(['success' => false, 'message' => 'Please upload a valid JSON file.']);
        exit;
    }

    // Pindahkan file yang diunggah ke lokasi yang diinginkan
    $targetPath = 'data/data.json';
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // File berhasil diupload, sekarang kita akan menghapus dan membuat ulang file 'complete.json' dan 'incomplete.json'

        // Tentukan path untuk file yang akan dibuat
        $completeFile = 'data/complete.json';
        $incompleteFile = 'data/incomplete.json';

        // Hapus file yang lama (jika ada) dan buat yang baru
        // Hapus file yang ada, jika ada
        if (file_exists($completeFile)) {
            unlink($completeFile);
        }

        if (file_exists($incompleteFile)) {
            unlink($incompleteFile);
        }

        // Membuat file incomplete.json yang baru dengan menyalin isi dari data.json
        copy($targetPath, $incompleteFile); // Kloning data.json ke incomplete.json

        // Membuat file complete.json yang baru dengan isi kosong
        file_put_contents($completeFile, json_encode([], JSON_PRETTY_PRINT)); // Buat file kosong untuk complete.json

        // Kirimkan respon sukses
        echo json_encode(['success' => true, 'message' => 'File uploaded successfully and required files created (fresh).']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
}
