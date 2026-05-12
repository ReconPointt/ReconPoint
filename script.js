// ============ DASHBOARD (index.html) ============
if (document.querySelector('.paket-grid')) {
    let selectedRank = null;
    let selectedPrice = null;

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

// ============ HALAMAN ORDER (order.html) ============
if (document.getElementById('orderForm')) {
    let selectedPayment = null;
    
    // Pilihan metode pembayaran
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => {
            selectedPayment = option.getAttribute('data-payment');
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            localStorage.setItem('selectedPayment', selectedPayment);
        });
    });
    
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
    
    // ============ SUBMIT FORM ============
    document.getElementById('orderForm').addEventListener('submit', async function(e) {
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
        
        // Ambil metode pembayaran dari localStorage atau dari selectedPayment
        const metodeBayar = localStorage.getItem('selectedPayment') || selectedPayment || 'Belum dipilih';
        
        if (!nama || !wa || !rankAwal || !idGame || !username) {
            alert('Mohon lengkapi semua data yang diperlukan!');
            return;
        }
        
        if (!agreeTerms) {
            alert('Anda harus menyetujui syarat dan ketentuan');
            return;
        }
        
        const idGameFull = server ? `${idGame} (server: ${server})` : idGame;
        
        // Data untuk dikirim ke Google Sheets
        const orderData = {
            waktu: new Date().toLocaleString('id-ID'),
            nama: nama,
            wa: wa,
            game: 'Mobile Legends',
            paket: selectedRank || 'Custom',
            harga: selectedPrice || 'Custom',
            rankAwal: rankAwal,
            rankTujuan: rankTujuan,
            idGame: idGameFull,
            username: username,
            catatan: catatan || '-',
            status: 'Baru'
        };
        
        // ============ KIRIM KE GOOGLE SHEETS ============
        // GANTI URL INI DENGAN WEB APP URL DARI GOOGLE APPS SCRIPT
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxtzzPLxeUxJ1MdpANC2e1rSYAecb3zzGTGKYN1T4Qmu4NUn7wdEd_b7t5qWadyJPtt/exec';
        
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            console.log('✅ Data terkirim ke Google Sheets');
        } catch (error) {
            console.error('❌ Gagal kirim ke Google Sheets:', error);
        }
        
        // Simpan ke localStorage (opsional, untuk admin.html yang lama)
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push({ id: Date.now(), ...orderData });
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // ============ KIRIM WHATSAPP ============
        // GANTI NOMOR WHATSAPP ADMIN DI SINI!
        const nomorAdmin = '6281313023459';  // <-- GANTI DENGAN NOMORMU
        
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
                      `*Metode Pembayaran:* ${metodeBayar}%0A%0A` +
                      `Mohon info total yang harus dibayar. Terima kasih!`;
        
        window.open(`https://wa.me/${nomorAdmin}?text=${pesan}`, '_blank');
        
        alert('✅ Order berhasil! Data tersimpan di Google Sheets. Admin akan menghubungi Anda via WhatsApp.');
        
        // Reset
        localStorage.removeItem('selectedRank');
        localStorage.removeItem('selectedPrice');
        localStorage.removeItem('selectedPayment');
        selectedPayment = null;
        
        this.reset();
        document.getElementById('rankTujuan').value = '';
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    });
}

// ============ FUNGSI UMUM ============
function scrollToPaket() {
    const paketSection = document.getElementById('paket');
    if (paketSection) {
        paketSection.scrollIntoView({ behavior: 'smooth' });
    }
}
