// Fungsi untuk memuat dan menampilkan data lowongan incomplete
function loadIncompleteLowonganData() {
    fetch('data/incomplete.json')
        .then(response => response.json())
        .then(data => {
            const backButton = document.getElementById('back-button');
            const daerahTitle = document.getElementById('daerah-title');
            const lowonganList = document.getElementById('lowongan-list');

            // Event listener untuk tombol kembali
            backButton.addEventListener('click', () => {
                window.history.back();
            });

            // Set judul halaman
            daerahTitle.textContent = 'Lowongan Incomplete';

            lowonganList.innerHTML = ''; // Mengosongkan list lowongan sebelum ditambahkan ulang

            // Iterasi melalui semua daerah di data
            for (const daerah in data) {
                // Menambahkan judul untuk setiap daerah
                const daerahHeader = document.createElement('h2');
                daerahHeader.textContent = daerah.charAt(0).toUpperCase() + daerah.slice(1);
                lowonganList.appendChild(daerahHeader);

                // Iterasi melalui nomor lowongan di setiap daerah
                for (const nomor in data[daerah]) {
                    const lowonganData = data[daerah][nomor];
                    const liLowongan = document.createElement('li');
                    liLowongan.className = 'lowongan-item';

                    // Menambahkan judul lowongan
                    const h5 = document.createElement('h5');
                    h5.textContent = `Lowongan ${nomor}`;
                    h5.className = 'lowongan-title';
                    liLowongan.appendChild(h5);

                    // Tombol untuk menyalin caption
                    const captionButton = document.createElement('button');
                    captionButton.textContent = 'Copy Caption';
                    captionButton.className = 'copy-button';
                    captionButton.onclick = () => {
                        navigator.clipboard.writeText(lowonganData.caption)
                            .then(() => alert('Caption copied to clipboard!'))
                            .catch(err => console.error('Error copying caption:', err));
                    };
                    liLowongan.appendChild(captionButton);

                    // Tombol untuk menyalin kontak jika ada
                    const kontak = lowonganData.kontak;
                    if (kontak) {
                        const kontakButton = document.createElement('button');
                        kontakButton.textContent = 'Copy Kontak';
                        kontakButton.className = 'copy-button';
                        kontakButton.onclick = () => {
                            navigator.clipboard.writeText(kontak)
                                .then(() => alert('Kontak copied to clipboard!'))
                                .catch(err => console.error('Error copying kontak:', err));
                        };
                        liLowongan.appendChild(kontakButton);
                    }

                    // Tombol Status (Mark as Completed / Incomplete)
                    const statusButton = document.createElement('button');
                    statusButton.className = 'status-button';

                    // Fungsi untuk memperbarui tampilan status
                    const updateStatusButton = (isCompleted) => {
                        statusButton.textContent = isCompleted ? 'Mark as Incomplete' : 'Mark as Completed';
                        statusButton.style.backgroundColor = isCompleted ? 'lightgreen' : '';
                    };

                    // Periksa status dari server
                    fetch('data/complete.json')
                        .then(res => res.json())
                        .then(completeData => {
                            const isCompleted = completeData[daerah] && completeData[daerah][nomor];
                            updateStatusButton(isCompleted);
                        })
                        .catch(err => console.error('Error fetching complete data:', err));

                    // Aksi tombol status untuk memperbarui status
                    statusButton.onclick = () => {
                        const newStatus = statusButton.textContent === 'Mark as Completed' ? 'completed' : 'incomplete';

                        // Kirim status ke server
                        fetch('save_status.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                data: { 
                                    daerah: daerah, 
                                    status: newStatus, 
                                    item: nomor 
                                }
                            }),
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                updateStatusButton(newStatus === 'completed');
                                
                                // Jika status berubah menjadi completed, hapus item dari daftar
                                if (newStatus === 'completed') {
                                    liLowongan.remove();
                                }

                                // Beri tahu halaman details.js untuk memperbarui status
                                const event = new CustomEvent('statusChanged', { detail: { daerah, nomor, newStatus } });
                                window.dispatchEvent(event);
                            } else {
                                alert(data.message);
                            }
                        })
                        .catch(error => console.error('Error:', error));
                    };

                    liLowongan.appendChild(statusButton);
                    lowonganList.appendChild(liLowongan);
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

// Memanggil fungsi loadIncompleteLowonganData pertama kali
loadIncompleteLowonganData();

// Mengatur auto-refresh setiap 10 detik (10000 ms)
setInterval(loadIncompleteLowonganData, 10000); // Update data setiap 10 detik
