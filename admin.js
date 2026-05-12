const ADMIN_PASSWORD = "admin123";
let orders = [];
let currentPage = "dashboard";
let orderChart = null;
let paketChart = null;
let rankChart = null;

function loadOrders() {
    const stored = localStorage.getItem('orders');
    orders = stored ? JSON.parse(stored) : [];
    updateAllStats();
    renderRecentOrders();
    renderOrdersTable();
    updateCharts();
    updateStatistics();
    
    const badge = document.getElementById('orderBadge');
    if (badge) badge.innerText = orders.length;
}

function updateAllStats() {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => o.waktu && new Date(o.waktu).toDateString() === today);
    const mlOrders = orders.filter(o => o.game === 'Mobile Legends');
    const uniqueCustomers = [...new Set(orders.map(o => o.wa))];
    
    document.getElementById('statTotal').innerText = orders.length;
    document.getElementById('statToday').innerText = todayOrders.length;
    document.getElementById('statML').innerText = mlOrders.length;
    document.getElementById('statCustomer').innerText = uniqueCustomers.length;
}

function renderRecentOrders() {
    const container = document.getElementById('recentOrders');
    if (!container) return;
    
    const recent = [...orders].reverse().slice(0, 5);
    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">Belum ada order</p>';
        return;
    }
    
    container.innerHTML = recent.map(order => `
        <div class="recent-item">
            <div class="recent-info">
                <h4>${escapeHtml(order.nama || '-')}</h4>
                <p>${order.game || '-'} • ${order.paket || '-'}</p>
            </div>
            <div class="recent-price">${order.harga || '-'}</div>
        </div>
    `).join('');
}

function renderOrdersTable() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filterGame = document.getElementById('filterGame')?.value || '';
    const filterDate = document.getElementById('filterDate')?.value || 'all';
    
    let filtered = orders.filter(order => {
        const matchSearch = (order.nama && order.nama.toLowerCase().includes(search)) || 
                           (order.idGame && order.idGame.toLowerCase().includes(search)) ||
                           (order.username && order.username.toLowerCase().includes(search));
        const matchGame = !filterGame || order.game === filterGame;
        
        let matchDate = true;
        if (filterDate === 'today') {
            matchDate = order.waktu && new Date(order.waktu).toDateString() === new Date().toDateString();
        } else if (filterDate === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchDate = order.waktu && new Date(order.waktu) >= weekAgo;
        } else if (filterDate === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchDate = order.waktu && new Date(order.waktu) >= monthAgo;
        }
        
        return matchSearch && matchGame && matchDate;
    });
    
    filtered.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
    
    const tbody = document.getElementById('orderList');
    if (!tbody) return;
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; padding:40px;">📭 Tidak ada order</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map((order, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(order.nama || '-')}</td>
            <td>${escapeHtml(order.wa || '-')}</td>
            <td>${escapeHtml(order.game || '-')}</td>
            <td>${escapeHtml(order.paket || '-')}</td>
            <td>${escapeHtml(order.rankAwal || '-')}</td>
            <td>${escapeHtml(order.rankTujuan || '-')}</td>
            <td>${escapeHtml(order.idGame || '-')}</td>
            <td>${escapeHtml(order.username || '-')}</td>
            <td>${order.harga || '-'}</td>
            <td style="font-size:12px">${order.waktu || '-'}</td>
            <td><button class="delete-btn" onclick="deleteOrder(${order.id})"><i class="fas fa-trash"></i> Hapus</button></td>
        </tr>
    `).join('');
}

function updateCharts() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthCount = {};
    
    orders.forEach(order => {
        if (order.waktu) {
            const date = new Date(order.waktu);
            const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
        }
    });
    
    const last7Months = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last7Months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }
    
    const chartData = last7Months.map(month => monthCount[month] || 0);
    
    const ctx = document.getElementById('orderChart')?.getContext('2d');
    if (ctx) {
        if (orderChart) orderChart.destroy();
        orderChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Months,
                datasets: [{
                    label: 'Jumlah Order',
                    data: chartData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102,126,234,0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top' } }
            }
        });
    }
    
    const paketCount = {};
    orders.forEach(order => {
        const paket = order.paket || 'Custom';
        paketCount[paket] = (paketCount[paket] || 0) + 1;
    });
    
    const paketCtx = document.getElementById('paketChart')?.getContext('2d');
    if (paketCtx) {
        if (paketChart) paketChart.destroy();
        paketChart = new Chart(paketCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(paketCount),
                datasets: [{
                    data: Object.values(paketCount),
                    backgroundColor: ['#667eea', '#764ba2', '#28a745', '#ffc107', '#dc3545', '#17a2b8']
                }]
            },
            options: { responsive: true }
        });
    }
    
    const rankCount = {};
    orders.forEach(order => {
        const rank = order.rankAwal || 'Unknown';
        rankCount[rank] = (rankCount[rank] || 0) + 1;
    });
    
    const rankCtx = document.getElementById('rankChart')?.getContext('2d');
    if (rankCtx) {
        if (rankChart) rankChart.destroy();
        rankChart = new Chart(rankCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(rankCount),
                datasets: [{
                    label: 'Jumlah Player',
                    data: Object.values(rankCount),
                    backgroundColor: '#667eea',
                    borderRadius: 8
                }]
            },
            options: { responsive: true }
        });
    }
}

function updateStatistics() {
    let totalRevenue = 0;
    orders.forEach(order => {
        const harga = order.harga || '0';
        const angka = parseInt(harga.replace(/[^0-9]/g, ''));
        if (!isNaN(angka)) totalRevenue += angka;
    });
    
    document.getElementById('totalRevenue').innerText = `Rp${totalRevenue.toLocaleString()}`;
    
    if (orders.length > 0) {
        const firstDate = new Date(orders[orders.length - 1].waktu);
        const today = new Date();
        const daysDiff = Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) || 1;
        const avgPerDay = (orders.length / daysDiff).toFixed(1);
        document.getElementById('avgPerDay').innerText = `${avgPerDay} order/hari`;
    }
    
    const paketCount = {};
    orders.forEach(order => {
        const paket = order.paket || 'Custom';
        paketCount[paket] = (paketCount[paket] || 0) + 1;
    });
    let bestPackage = '-';
    let maxCount = 0;
    for (const [paket, count] of Object.entries(paketCount)) {
        if (count > maxCount) {
            maxCount = count;
            bestPackage = paket;
        }
    }
    document.getElementById('bestPackage').innerText = bestPackage !== '-' ? `${bestPackage} (${maxCount} order)` : '-';
}

function deleteOrder(id) {
    if (confirm('Hapus order ini?')) {
        orders = orders.filter(o => o.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }
}

function exportToExcel() {
    if (orders.length === 0) {
        alert('Tidak ada data untuk diexport');
        return;
    }
    
    let html = `<html><head><meta charset="UTF-8"><title>Data Order JokiGame</title></head><body>
    <table border="1" cellpadding="5" cellspacing="0">
        <thead><tr>
            <th>No</th><th>Nama</th><th>WA</th><th>Game</th><th>Paket</th>
            <th>Rank Awal</th><th>Rank Tujuan</th><th>ID Game</th>
            <th>Username</th><th>Harga</th><th>Catatan</th><th>Waktu</th>
        </tr></thead><tbody>`;
    
    orders.forEach((order, i) => {
        html += `<tr>
            <td>${i+1}</td><td>${order.nama || '-'}</td><td>${order.wa || '-'}</td>
            <td>${order.game || '-'}</td><td>${order.paket || '-'}</td>
            <td>${order.rankAwal || '-'}</td><td>${order.rankTujuan || '-'}</td>
            <td>${order.idGame || '-'}</td><td>${order.username || '-'}</td>
            <td>${order.harga || '-'}</td><td>${order.catatan || '-'}</td>
            <td>${order.waktu || '-'}</td>
        </tr>`;
    });
    
    html += `</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().slice(0,19)}.xls`;
    link.click();
}

function clearAllOrders() {
    if (confirm('⚠️ HAPUS SEMUA ORDER? Tindakan ini tidak bisa dibatalkan!')) {
        orders = [];
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function changePage(page) {
    currentPage = page;
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) item.classList.add('active');
    });
    
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('ordersContent').style.display = 'none';
    document.getElementById('statisticsContent').style.display = 'none';
    document.getElementById('settingsContent').style.display = 'none';
    
    if (page === 'dashboard') {
        document.getElementById('dashboardContent').style.display = 'block';
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
    } else if (page === 'orders') {
        document.getElementById('ordersContent').style.display = 'block';
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-shopping-cart"></i> Daftar Order';
        renderOrdersTable();
    } else if (page === 'statistics') {
        document.getElementById('statisticsContent').style.display = 'block';
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-chart-bar"></i> Statistik';
        updateCharts();
        updateStatistics();
    } else if (page === 'settings') {
        document.getElementById('settingsContent').style.display = 'block';
        document.getElementById('pageTitle').innerHTML = '<i class="fas fa-cog"></i> Pengaturan';
        loadSettings();
    }
}

function loadSettings() {
    const savedWa = localStorage.getItem('adminWa') || '6281234567890';
    document.getElementById('adminWa').value = savedWa;
}

function saveSettings() {
    const newWa = document.getElementById('adminWa').value;
    if (newWa) {
        localStorage.setItem('adminWa', newWa);
        alert('Nomor WhatsApp berhasil disimpan!');
    }
}

function changePassword() {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    if (!newPass) {
        alert('Masukkan password baru!');
        return;
    }
    
    if (newPass !== confirmPass) {
        alert('Password tidak cocok!');
        return;
    }
    
    localStorage.setItem('adminPassword', newPass);
    alert('Password berhasil diubah!');
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function backupData() {
    const data = {
        orders: orders,
        adminWa: localStorage.getItem('adminWa')
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_jokigame_${new Date().toISOString().slice(0,19)}.json`;
    link.click();
}

function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.orders) {
                localStorage.setItem('orders', JSON.stringify(data.orders));
                if (data.adminWa) localStorage.setItem('adminWa', data.adminWa);
                alert('Restore data berhasil!');
                location.reload();
            } else {
                alert('File backup tidak valid!');
            }
        } catch(err) {
            alert('Gagal membaca file backup!');
        }
    };
    reader.readAsText(file);
}

function checkLogin() {
    const savedPassword = localStorage.getItem('adminPassword');
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    
    if (adminLoggedIn === 'true') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        loadOrders();
    }
}

document.getElementById('loginBtn')?.addEventListener('click', () => {
    const pwd = document.getElementById('password').value;
    const savedPassword = localStorage.getItem('adminPassword') || ADMIN_PASSWORD;
    
    if (pwd === savedPassword) {
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        loadOrders();
    } else {
        alert('Password salah!');
    }
});

document.getElementById('logoutBtnSidebar')?.addEventListener('click', () => {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
});

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        changePage(page);
    });
});

document.getElementById('viewAllOrders')?.addEventListener('click', (e) => {
    e.preventDefault();
    changePage('orders');
});

document.getElementById('exportExcelBtn')?.addEventListener('click', exportToExcel);
document.getElementById('exportOrdersBtn')?.addEventListener('click', exportToExcel);
document.getElementById('refreshOrdersBtn')?.addEventListener('click', () => renderOrdersTable());
document.getElementById('clearAllBtn')?.addEventListener('click', clearAllOrders);
document.getElementById('saveWaBtn')?.addEventListener('click', saveSettings);
document.getElementById('changePasswordBtn')?.addEventListener('click', changePassword);
document.getElementById('backupDataBtn')?.addEventListener('click', backupData);
document.getElementById('restoreDataBtn')?.addEventListener('click', () => {
    document.getElementById('restoreFile').click();
});
document.getElementById('restoreFile')?.addEventListener('change', (e) => {
    if (e.target.files[0]) restoreData(e.target.files[0]);
});
document.getElementById('clearDataBtn')?.addEventListener('click', clearAllOrders);

document.getElementById('searchInput')?.addEventListener('input', renderOrdersTable);
document.getElementById('filterGame')?.addEventListener('change', renderOrdersTable);
document.getElementById('filterDate')?.addEventListener('change', renderOrdersTable);

document.getElementById('menuToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

checkLogin();
