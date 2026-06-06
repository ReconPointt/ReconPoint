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
        
        const total = selectedHargaPerBintang * jumlahBintang;
        
        totalHargaDisplay.innerText = formatRupiah(total);
        totalPriceElement.innerText = formatRupiah(total);
        jumlahBintangElement.innerText = jumlahBintang;
        
        // Simpan ke localStorage
        localStorage.setItem('jumlahBintang', jumlahBintang);
        localStorage.setItem('totalHarga', total);
    }
    
    if (jumlahBintangInput) {
       
