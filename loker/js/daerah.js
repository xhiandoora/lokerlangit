// Fungsi untuk memuat dan menampilkan data dari file JSON
function loadData() {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('daerah'); // Mengambil elemen <ul> dengan ID 'daerah'
            const searchInput = document.getElementById('search-input'); // Mengambil elemen input pencarian

            // Array untuk menyimpan daerah
            const daerahArray = Object.keys(data).map(daerah => ({
                name: daerah.charAt(0).toUpperCase() + daerah.slice(1),
                originalName: daerah // Menyimpan nama asli untuk pencarian
            }));

            // Fungsi untuk menampilkan daftar daerah
            function displayDaerah(filteredDaerah) {
                container.innerHTML = ''; // Kosongkan daftar daerah sebelumnya
                filteredDaerah.forEach(daerah => {
                    const liDaerah = document.createElement('li'); 
                    liDaerah.className = 'daerah-item'; // Menambahkan class untuk item daerah

                    const h3 = document.createElement('h3');
                    h3.textContent = daerah.name; // Menampilkan nama daerah
                    h3.className = 'daerah-title'; // Menambahkan class untuk judul daerah
                    
                    // Tambahkan event listener untuk klik pada h3
                    h3.addEventListener('click', () => {
                        // Arahkan ke halaman detail dengan query string
                        window.location.href = 'details.html?daerah=' + daerah.originalName;    
                    });

                    liDaerah.appendChild(h3); // Menambahkan <h3> ke dalam <li> daerah
                    container.appendChild(liDaerah); // Menambahkan <li> daerah ke dalam <ul> utama
                });
            }

            // Tampilkan semua daerah saat pertama kali dimuat
            displayDaerah(daerahArray);

            // Event listener untuk input pencarian
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.toLowerCase(); // Ambil nilai input dan ubah ke lowercase
                const filteredDaerah = daerahArray.filter(daerah => 
                    daerah.originalName.toLowerCase().includes(query) // Filter daerah berdasarkan input
                );
                displayDaerah(filteredDaerah); // Tampilkan daerah yang sudah difilter
            });
        })
        .catch(error => console.error('Error:', error));
}

// Memanggil fungsi loadData pertama kali
loadData();

// Mengatur auto-refresh setiap 10 detik (10000 ms)
setInterval(loadData, 10000); // Update data setiap 10 detik
