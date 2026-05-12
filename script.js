// ========== DASHBOARD (index.html) ==========
if (document.querySelector('.paket-grid')) {
    let selectedRank = null;
    let selectedPrice = null;

    // Klik paket card
    document.querySelectorAll('.paket-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('pilih-btn') || e.target.closest('.pilih-btn')) return;
            
            document.querySelectorAll('.paket-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            selectedRank = card.getAttribute('data-rank');
            selectedPrice = card.querySelector('.price').innerText;
        });

        const btn = card.querySelector('.pilih-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedRank = card.getAttribute('data-rank');
                selectedPrice = card.querySelector('.price').innerText;
                
                localStorage.setItem('selectedRank', selectedRank);
                localStorage.setItem('selectedPrice', selectedPrice);
                
                window.location.href = 'order.html';
            });
        }
    });
}

// ========== HALAMAN ORDER (order.html) ==========
if (document.getElementById('orderForm')) {
    const selectedRank = localStorage.getItem('selectedRank');
    const selectedPrice = localStorage.getItem('selectedPrice');
    
    if (selectedRank && selectedPrice) {
        document.getElementById('selectedRank').innerText = selectedRank;
        document.getElementById('selectedPrice').innerText = selectedPrice;
        document.getElementById('totalPrice').innerText = selectedPrice;
        const rankTujuanInput = document.getElementById('rankTujuan');
        if (rankTujuanInput) {
            const targetRank = selectedRank.split(' → ')[1] || selectedRank;
            rankTujuanInput.value = targetRank;
        }
    } else {
        document.getElementById('selectedRank').innerText = 'Belum ada paket dipilih';
        document.getElementById('selectedPrice').innerText = 'Rp0';
        document.getElementById('totalPrice').innerText = 'Rp0';
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nama = document.getElementById('nama').value.trim();
        const wa = document.getElementById('wa').value.trim();
        const rankAwal = document.getElementById('rankAwal').value;
        const rankTujuan = document.getElementById('rankTujuan').value;
        const idGame = document.getElementById('idGame').value.trim();
        const server = document.getElementById('server').value.trim();
        const username = document.getElementById('username').value.trim();
        const catatan = document.getElementById('catatan').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        if (!nama || !wa || !rankAwal || !idGame || !username) {
            alert('Mohon lengkapi semua data yang diperlukan!');
            return;
        }
        
        if (!agreeTerms) {
            alert('Anda harus menyetujui syarat dan ketentuan');
            return;
        }
        
        const idGameFull = server ? `${idGame} (server: ${server})` : idGame;
        
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const newOrder = {
            id: Date.now(),
            nama: nama,
            wa: wa,
            game: 'Mobile Legends',
            paket: selectedRank || 'Custom',
            rankAwal: rankAwal,
            rankTujuan: rankTujuan,
            idGame: idGameFull,
            username: username,
            harga: selectedPrice || 'Custom',
            catatan: catatan,
            waktu: new Date().toLocaleString('id-ID')
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        const pesan = `Halo Admin JokiGame! Saya ingin order joki ML.%0A%0A` +
                      `*Data Diri:*%0A` +
                      `Nama: ${nama}%0A` +
                      `No WhatsApp: ${wa}%0A%0A` +
                      `*Detail Order:*%0A` +
                      `Game: Mobile Legends%0A` +
                      `Paket: ${selectedRank || 'Custom'}%0A` +
                      `Harga: ${selectedPrice || 'Chat admin'}%0A` +
                      `Rank Awal: ${rankAwal}%0A` +
                      `Rank Tujuan: ${rankTujuan}%0A` +
                      `ID Game: ${idGameFull}%0A` +
                      `Username: ${username}%0A` +
                      `Catatan: ${catatan || '-'}%0A%0A` +
                      `Mohon info cara pembayaran. Terima kasih!`;
        
        const nomorAdmin = '6281313023459';
        
        window.open(`https://wa.me/${nomorAdmin}?text=${pesan}`, '_blank');
        
        alert('✅ Order berhasil! Anda akan diarahkan ke WhatsApp admin.');
        
        localStorage.removeItem('selectedRank');
        localStorage.removeItem('selectedPrice');
        
        this.reset();
        document.getElementById('rankTujuan').value = '';
    });
}

// ========== FUNGSI UMUM ==========
// Scroll ke paket
function scrollToPaket() {
    const paketSection = document.getElementById('paket');
    if (paketSection) {
        paketSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load logo
function loadWebsiteLogo() {
    const savedLogo = localStorage.getItem('websiteLogo');
    const logoImgs = document.querySelectorAll('#logoImg, #footerLogoImg');
    logoImgs.forEach(img => {
        if (savedLogo && img) {
            img.src = savedLogo;
        } else if (img) {
            img.src = "https://placehold.co/40x40/667eea/white?text=ML";
        }
    });
}
loadWebsiteLogo();

window.addEventListener('storage', (e) => {
    if (e.key === 'websiteLogo' || e.key === 'logoUpdated') {
        loadWebsiteLogo();
    }
});