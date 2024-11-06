// Fungsi untuk memuat dan menampilkan data berdasarkan 'daerah' dari URL
function loadLowonganData() {
    const urlParams = new URLSearchParams(window.location.search);
    const daerah = urlParams.get('daerah'); // Mengambil parameter 'daerah' dari URL

    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const daerahTitle = document.getElementById('daerah-title');
            const lowonganList = document.getElementById('lowongan-list');
            const backButton = document.getElementById('back-button');

            // Event listener untuk tombol kembali
            backButton.addEventListener('click', () => {
                window.history.back();
            });

            if (data[daerah]) {
                daerahTitle.textContent = daerah.charAt(0).toUpperCase() + daerah.slice(1);
                lowonganList.innerHTML = ''; // Mengosongkan list lowongan sebelum ditambahkan ulang

                for (const nomor in data[daerah]) {
                    const liLowongan = document.createElement('li');
                    liLowongan.className = 'lowongan-item';

                    const h5 = document.createElement('h5');
                    h5.textContent = `Lowongan ${nomor}`;
                    h5.className = 'lowongan-title';
                    liLowongan.appendChild(h5);

                    // Tombol Copy Caption
                    const captionButton = document.createElement('button');
                    captionButton.textContent = 'Copy Caption';
                    captionButton.className = 'copy-button';
                    captionButton.onclick = () => {
                        navigator.clipboard.writeText(data[daerah][nomor].caption)
                            .then(() => alert('Caption copied to clipboard!'))
                            .catch(err => console.error('Error copying caption:', err));
                    };
                    liLowongan.appendChild(captionButton);

                    // Tombol Copy Kontak
                    const kontak = data[daerah][nomor].kontak;
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

                    // Menambahkan tombol untuk menandai status selesai
                    const statusButton = document.createElement('button');
                    statusButton.className = 'status-button';

                    // Fungsi untuk memperbarui tampilan status
                    const updateStatusButton = (isCompleted) => {
                        statusButton.textContent = isCompleted ? 'Mark as Incomplete' : 'Mark as Completed';
                        statusButton.style.backgroundColor = isCompleted ? 'lightgreen' : '';
                    };

                    // Cek status yang tersimpan di localStorage (jika ada)
                    const savedStatus = localStorage.getItem(`${daerah}_${nomor}_status`);
                    if (savedStatus) {
                        updateStatusButton(savedStatus === 'completed');
                    } else {
                        // Periksa status dari server (complete.json)
                        fetch('data/complete.json')
                            .then(res => res.json())
                            .then(completeData => {
                                const isCompleted = completeData[daerah] && completeData[daerah][nomor];
                                updateStatusButton(isCompleted);
                            })
                            .catch(err => console.error('Error fetching complete data:', err));
                    }

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
                                // Simpan status baru di localStorage
                                localStorage.setItem(`${daerah}_${nomor}_status`, newStatus);
                                updateStatusButton(newStatus === 'completed');
                            } else {
                                alert(data.message);
                            }
                        })
                        .catch(error => console.error('Error:', error));
                    };

                    liLowongan.appendChild(statusButton);
                    lowonganList.appendChild(liLowongan);
                }
            } else {
                daerahTitle.textContent = 'Daerah tidak ditemukan';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Menambahkan event listener untuk menerima statusChanged dan memperbarui tombol status
window.addEventListener('statusChanged', (event) => {
    const { daerah, nomor, newStatus } = event.detail;

    // Mencari lowongan yang sesuai di halaman
    const lowonganItems = document.querySelectorAll('.lowongan-item');
    lowonganItems.forEach((li) => {
        const h5 = li.querySelector('.lowongan-title');
        if (h5 && h5.textContent.includes(nomor)) {
            const statusButton = li.querySelector('.status-button');
            if (statusButton) {
                // Memperbarui tombol berdasarkan status baru
                const isCompleted = newStatus === 'completed';
                statusButton.textContent = isCompleted ? 'Mark as Incomplete' : 'Mark as Completed';
                statusButton.style.backgroundColor = isCompleted ? 'lightgreen' : '';
            }
        }
    });
});

// Memanggil fungsi loadLowonganData pertama kali
loadLowonganData();

// Mengatur auto-refresh setiap 10 detik (10000 ms)
setInterval(loadLowonganData, 10000); // Update data setiap 10 detik
