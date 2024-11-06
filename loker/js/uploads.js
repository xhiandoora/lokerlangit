document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Mencegah refresh halaman

  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  // Kirim file ke server melalui AJAX
  fetch('uploads.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    const messageDiv = document.getElementById('uploadMessage');
    if (data.success) {
      // Menampilkan pesan sukses
      messageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;

      // Hapus localStorage setelah upload berhasil
      localStorage.clear(); // Menghapus semua data di localStorage
      // Jika ingin menghapus item tertentu saja:
      // localStorage.removeItem('key_name');

      // Opsional: Anda bisa menambahkan alert untuk memberitahukan pengguna bahwa cache telah dihapus
      alert('File uploaded successfully! LocalStorage has been cleared.');
    } else {
      messageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});
