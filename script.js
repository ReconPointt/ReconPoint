// ============ DASHBOARD (index.html) ============
if (document.querySelector('.paket-grid')) {
    let selectedRank = null;
    let selectedRankAwal = null;
    let selectedHargaPerBintang = null;

    document.querySelectorAll('.paket-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('pilih-btn') || e.target.closest('.pilih-btn')) return;
            
            document.querySelectorAll('.paket-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            selectedRank = card.getAttribute('data-rank');
            selectedRankAwal = card.getAttribute('data-rank-awal');
            selectedHargaPerBintang = card.getAttribute('data-harga-per-bintang');
        });

        const btn = card.querySelector('.pilih-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedRank = card.getAttribute('data-rank');
                selectedRankAwal = card.getAttribute('data-rank-awal');
                selectedHargaPerBintang = card.getAttribute('data-harga-per-bintang');
                
                console.log('Paket dipilih:', selectedRank, 'Harga per bintang:', selectedHargaPerBintang);
                
                localStorage.setItem('selectedRank', selectedRank);
                localStorage.setItem('selectedRankAwal', selectedRankAwal);
                localStorage.setItem('selectedHargaPerBintang', selectedHargaPerBintang);
                
                window.location.href = 'order.html';
            });
        }
    });
}

// ============ FUNGSI FORMAT RUPIAH ============
function formatRupiah(angka) {
    if (!angka) return 'Rp0';
    return 'Rp' + parseInt(angka).toLocaleString('id-ID');
}

// ============ HALAMAN ORDER (order.html) ============
if (document.getElementById('orderForm')) {
    let selectedPayment = null;
    
    // Ambil data paket dari localStorage
    const selectedRank = localStorage.getItem('selectedRank');
    const selectedRankAwal = localStorage.getItem('selectedRankAwal');
    const selectedHargaPerBintang = parseInt(localStorage.getItem('selectedHargaPerBintang')) || 0;
    
    // Tampilkan informasi paket
    if (selectedRank && selectedRankAwal) {
        document.getElementById('selectedRank').innerText = `${selectedRankAwal} → ${selectedRank}`;
        document.getElementById('rankAwalDisplay').value = selectedRankAwal;
        document.getElementById('rankTujuanDisplay').value = selectedRank;
        document.getElementById('hargaPerBintang').innerText = formatRupiah(selectedHargaPerBintang);
        document.getElementById('hargaPerBintangDisplay').innerText = formatRupiah(selectedHargaPerBintang);
    } else {
        document.getElementById('selectedRank').innerText = 'Belum ada paket dipilih';
        document.getElementById('rankAwalDisplay').value = '-';
        document.getElementById('rankTujuanDisplay').value = '-';
    }
    
    // ============ KALKULATOR BINTANG ============
    const jumlahBintangInput = document.getElementById('jumlahBintangInput');
    const totalHargaDisplay = document.getElementById('totalHargaDisplay');
    const totalPriceElement = document.getElementById('totalPrice');
    const jumlahBintangElement = document.getElementById('jumlahBintang');
    
    function updateTotalHarga() {
        let jumlahBintang = parseInt(jumlahBintangInput.value) || 0;
        if (jumlahBintang < 1) jumlahBintang = 1;
        if (jumlahBintang > 100) jumlahBintang = 100;
        
        if (jumlahBintangInput.value < 1) jumlahBintangInput.value = 1;
        if (jumlahBintangInput.value > 100) jumlahBintangInput.value = 100;
        
        const total = selectedHargaPerBintang * jumlahBintang;
        
        totalHargaDisplay.innerText = formatRupiah(total);
        totalPriceElement.innerText = formatRupiah(total);
        jumlahBintangElement.innerText = jumlahBintang;
        
        localStorage.setItem('jumlahBintang', jumlahBintang);
        localStorage.setItem('totalHarga', total);
    }
    
    if (jumlahBintangInput) {
        jumlahBintangInput.addEventListener('input', updateTotalHarga);
        updateTotalHarga();
    }
    
    // Pilihan metode pembayaran
    const paymentOptions = document.querySelectorAll('.payment-option');
    if (paymentOptions.length > 0) {
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                selectedPayment = option.getAttribute('data-payment');
                document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                localStorage.setItem('selectedPayment', selectedPayment);
                
                const paymentError = document.getElementById('paymentError');
                const paymentMethodsDiv = document.getElementById('paymentMethods');
                if (paymentError) paymentError.classList.remove('show');
                if (paymentMethodsDiv) paymentMethodsDiv.classList.remove('error');
            });
        });
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // SUBMIT FORM
    document.getElementById('orderForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nama = document.getElementById('nama').value.trim();
        const wa = document.getElementById('wa').value.trim();
        const rankAwal = document.getElementById('rankAwalDisplay').value;
        const rankTujuan = document.getElementById('rankTujuanDisplay').value;
        const idGame = document.getElementById('idGame').value.trim();
        const server = document.getElementById('server').value.trim();
        const username = document.getElementById('username').value.trim();
        const catatan = document.getElementById('catatan').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const jumlahBintang = localStorage.getItem('jumlahBintang') || 1;
        const totalHarga = localStorage.getItem('totalHarga') || 0;
        
        // Validasi data dasar
        if (!nama || !wa || !idGame || !username) {
            alert('Mohon lengkapi semua data yang diperlukan!');
            return;
        }
        
        if (!agreeTerms) {
            alert('Anda harus menyetujui syarat dan ketentuan');
            return;
        }
        
        // Validasi metode pembayaran
        const selectedPaymentMethod = document.querySelector('.payment-option.selected');
        const paymentError = document.getElementById('paymentError');
        const paymentMethodsDiv = document.getElementById('paymentMethods');
        
        if (!selectedPaymentMethod) {
            if (paymentError) paymentError.classList.add('show');
            if (paymentMethodsDiv) paymentMethodsDiv.classList.add('error');
            if (paymentMethodsDiv) {
                paymentMethodsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            alert('⚠️ Silakan pilih metode pembayaran terlebih dahulu!');
            return;
        }
        
        if (paymentError) paymentError.classList.remove('show');
        if (paymentMethodsDiv) paymentMethodsDiv.classList.remove('error');
        
        const metodeBayar = selectedPaymentMethod.getAttribute('data-payment');
        localStorage.setItem('selectedPayment', metodeBayar);
        
        const idGameFull = server ? `${idGame} (server: ${server})` : idGame;
        const hargaPerBintang = selectedHargaPerBintang;
        
        // Data untuk Google Sheets
        const orderData = {
            waktu: new Date().toLocaleString('id-ID'),
            nama: nama,
            wa: wa,
            game: 'Mobile Legends',
            paket: `${selectedRankAwal} → ${selectedRank}`,
            rankAwal: rankAwal,
            rankTujuan: rankTujuan,
            jumlahBintang: jumlahBintang,
            hargaPerBintang: formatRupiah(hargaPerBintang),
            totalHarga: formatRupiah(totalHarga),
            idGame: idGameFull,
            username: username,
            catatan: catatan || '-',
            metodeBayar: metodeBayar,
            status: 'Baru'
        };
        
        // ============ KIRIM KE GOOGLE SHEETS ============
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFXueGp3BbQeTJ6d9gT4L0Ps9t0Cj7EhHvS3M273n-xgVxtQd8A0Hj-elYC0UHfJDh/exec';
        
        // Buat FormData dengan format URLSearchParams
        const formData = new URLSearchParams();
        formData.append('waktu', orderData.waktu);
        formData.append('nama', orderData.nama);
        formData.append('wa', orderData.wa);
        formData.append('game', orderData.game);
        formData.append('paket', orderData.paket);
        formData.append('rankAwal', orderData.rankAwal);
        formData.append('rankTujuan', orderData.rankTujuan);
        formData.append('jumlahBintang', orderData.jumlahBintang);
        formData.append('hargaPerBintang', orderData.hargaPerBintang);
        formData.append('totalHarga', orderData.totalHarga);
        formData.append('idGame', orderData.idGame);
        formData.append('username', orderData.username);
        formData.append('catatan', orderData.catatan);
        formData.append('metodeBayar', orderData.metodeBayar);
        formData.append('status', orderData.status);
        
        console.log('🔍 Data yang dikirim:', Object.fromEntries(formData));
        
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });
            console.log('✅ Fetch berhasil dikirim ke Google Sheets');
        } catch (error) {
            console.error('❌ Fetch error:', error);
        }
        
        // Simpan ke localStorage (backup)
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push({ id: Date.now(), ...orderData });
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Kirim WhatsApp
        const nomorAdmin = '6281313023459';
        
        const pesan = `Halo Admin ReconPoint! Saya ingin order joki ML.%0A%0A` +
                      `*Data Diri:*%0A` +
                      `Nama: ${nama}%0A` +
                      `No WhatsApp: ${wa}%0A%0A` +
                      `*Detail Order:*%0A` +
                      `Game: Mobile Legends%0A` +
                      `Paket: ${selectedRankAwal} → ${selectedRank}%0A` +
                      `Jumlah Bintang: ${jumlahBintang} bintang%0A` +
                      `Harga per bintang: ${formatRupiah(hargaPerBintang)}%0A` +
                      `Total Harga: ${formatRupiah(totalHarga)}%0A` +
                      `Rank Awal: ${rankAwal}%0A` +
                      `Rank Tujuan: ${rankTujuan}%0A` +
                      `ID Game: ${idGameFull}%0A` +
                      `Username: ${username}%0A` +
                      `Catatan: ${catatan || '-'}%0A%0A` +
                      `*Metode Pembayaran:* ${metodeBayar}%0A%0A` +
                      `Mohon info total yang harus dibayar. Terima kasih!`;
        
        window.open(`https://wa.me/${nomorAdmin}?text=${pesan}`, '_blank');
        
        alert('✅ Order berhasil! Data tersimpan. Admin akan menghubungi Anda via WhatsApp.');
        
        // Reset
        localStorage.removeItem('selectedRank');
        localStorage.removeItem('selectedRankAwal');
        localStorage.removeItem('selectedHargaPerBintang');
        localStorage.removeItem('selectedPayment');
        localStorage.removeItem('jumlahBintang');
        localStorage.removeItem('totalHarga');
        
        this.reset();
        document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    });
}

// ============ FUNGSI UMUM ============
function scrollToPaket() {
    const paketSection = document.getElementById('paket');
    if (paketSection) {
        paketSection.scrollIntoView({ behavior: 'smooth' });
    }
}
