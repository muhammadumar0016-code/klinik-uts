class KlinikApp {
    constructor() {
        this.baseUrl = '';
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
    }

    checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                if (section) {
                    this.loadSection(section);
                }
            }

            if (e.target.classList.contains('logout-btn')) {
                this.handleLogout();
            }

            if (e.target.classList.contains('menu-toggle')) {
                this.toggleMobileMenu();
            }
        });

        // Close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
                this.closeModals();
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await this.apiCall('auth.php', 'POST', data);
            this.currentUser = response.data;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showDashboard();
            this.showAlert('Login berhasil!', 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    handleLogout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLogin();
        this.showAlert('Logout berhasil!', 'success');
    }

    showLogin() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        this.loadSection('dashboard');
    }

    async loadSection(section) {
        this.currentSection = section;
        
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Close mobile menu
        this.toggleMobileMenu(false);

        const content = document.getElementById('mainContent');
        content.innerHTML = '<div class="loading">Memuat...</div>';
        
        try {
            switch(section) {
                case 'dashboard':
                    content.innerHTML = this.getDashboardHTML();
                    await this.loadDashboardData();
                    break;
                case 'poli':
                    content.innerHTML = this.getPoliHTML();
                    await this.loadPoliData();
                    break;
                case 'dokter':
                    content.innerHTML = this.getDokterHTML();
                    await this.loadDokterData();
                    break;
                case 'pasien':
                    content.innerHTML = this.getPasienHTML();
                    await this.loadPasienData();
                    break;
                case 'pendaftaran':
                    content.innerHTML = this.getPendaftaranHTML();
                    await this.loadPendaftaranData();
                    break;
                case 'rekam_medis':
                    content.innerHTML = this.getRekamMedisHTML();
                    await this.loadRekamMedisData();
                    break;
                case 'obat':
                    content.innerHTML = this.getObatHTML();
                    await this.loadObatData();
                    break;
                case 'pembayaran':
                    content.innerHTML = this.getPembayaranHTML();
                    await this.loadPembayaranData();
                    break;
            }
        } catch (error) {
            content.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    // ==================== DASHBOARD ====================
    getDashboardHTML() {
        return `
            <div class="section">
                <h2 class="section-title">Dashboard</h2>
                <div class="stats-grid" id="statsGrid">
                    <div class="stat-card">
                        <span class="stat-number" id="totalPoli">0</span>
                        <span class="stat-label">Total Poli</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="totalDokter">0</span>
                        <span class="stat-label">Total Dokter</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="totalPasien">0</span>
                        <span class="stat-label">Total Pasien</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="totalPendaftaran">0</span>
                        <span class="stat-label">Pendaftaran Hari Ini</span>
                    </div>
                </div>
            </div>
            <div class="section">
                <h3 class="section-title">Pendaftaran Terbaru</h3>
                <div id="recentRegistrations"></div>
            </div>
        `;
    }

    async loadDashboardData() {
        try {
            const [poli, dokter, pasien, pendaftaran] = await Promise.all([
                this.apiCall('poli.php'),
                this.apiCall('dokter.php'),
                this.apiCall('pasien.php'),
                this.apiCall('pendaftaran.php')
            ]);

            document.getElementById('totalPoli').textContent = poli.data.length;
            document.getElementById('totalDokter').textContent = dokter.data.length;
            document.getElementById('totalPasien').textContent = pasien.data.length;
            
            const today = new Date().toISOString().split('T')[0];
            const todayRegistrations = pendaftaran.data.filter(reg => reg.tanggal_daftar === today);
            document.getElementById('totalPendaftaran').textContent = todayRegistrations.length;

            // Show recent registrations
            const recent = pendaftaran.data.slice(0, 5);
            const recentHTML = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Pasien</th>
                                <th>Dokter</th>
                                <th>Tanggal</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recent.map((reg, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${reg.nama_pasien}</td>
                                    <td>${reg.nama_dokter}</td>
                                    <td>${reg.tanggal_daftar} ${reg.jam_daftar}</td>
                                    <td><span class="status-badge status-${reg.status.toLowerCase()}">${reg.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('recentRegistrations').innerHTML = recentHTML;
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // ==================== POLI ====================
    getPoliHTML() {
        return `
            <div class="section">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="section-title">Data Poli</h2>
                    <button class="btn btn-primary" onclick="app.showPoliForm()">Tambah Poli</button>
                </div>
                <div id="poliList"></div>
            </div>
        `;
    }

    async loadPoliData() {
        try {
            const response = await this.apiCall('poli.php');
            const poliList = document.getElementById('poliList');
            
            if (response.data.length === 0) {
                poliList.innerHTML = '<div class="no-data">Tidak ada data poli</div>';
                return;
            }

            const html = `
                <div class="cards-grid">
                    ${response.data.map(poli => `
                        <div class="card">
                            <h3>${poli.nama_poli}</h3>
                            <p><strong>Lokasi:</strong> ${poli.lokasi}</p>
                            <p>${poli.deskripsi}</p>
                            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                                <button class="btn btn-primary" onclick="app.editPoli(${poli.id_poli})">Edit</button>
                                <button class="btn btn-danger" onclick="app.deletePoli(${poli.id_poli})">Hapus</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            poliList.innerHTML = html;
        } catch (error) {
            document.getElementById('poliList').innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    showPoliForm(poli = null) {
        const isEdit = !!poli;
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 2rem; border-radius: 10px; width: 90%; max-width: 500px;">
                <h3>${isEdit ? 'Edit' : 'Tambah'} Poli</h3>
                <form id="poliForm">
                    <input type="hidden" name="id_poli" value="${poli ? poli.id_poli : ''}">
                    <div class="form-group">
                        <label>Nama Poli</label>
                        <input type="text" name="nama_poli" class="form-control" value="${poli ? poli.nama_poli : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Deskripsi</label>
                        <textarea name="deskripsi" class="form-control" rows="3">${poli ? poli.deskripsi : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Lokasi</label>
                        <input type="text" name="lokasi" class="form-control" value="${poli ? poli.lokasi : ''}" required>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-danger close-modal">Batal</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = document.getElementById('poliForm');
        form.addEventListener('submit', (e) => this.handlePoliSubmit(e, isEdit));
    }

    async handlePoliSubmit(e, isEdit) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            nama_poli: formData.get('nama_poli'),
            deskripsi: formData.get('deskripsi'),
            lokasi: formData.get('lokasi')
        };

        if (isEdit) {
            data.id_poli = formData.get('id_poli');
        }

        try {
            const endpoint = isEdit ? 'poli.php' : 'poli.php';
            const method = isEdit ? 'PUT' : 'POST';
            await this.apiCall(endpoint, method, data);
            this.closeModals();
            this.loadPoliData();
            this.showAlert(`Poli berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}!`, 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async editPoli(id) {
        try {
            const response = await this.apiCall(`poli.php?id=${id}`);
            this.showPoliForm(response.data);
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async deletePoli(id) {
        if (confirm('Apakah Anda yakin ingin menghapus poli ini?')) {
            try {
                await this.apiCall('poli.php', 'DELETE', { id_poli: id });
                this.loadPoliData();
                this.showAlert('Poli berhasil dihapus!', 'success');
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        }
    }

    // ==================== DOKTER ====================
    getDokterHTML() {
        return `
            <div class="section">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="section-title">Data Dokter</h2>
                    <button class="btn btn-primary" onclick="app.showDokterForm()">Tambah Dokter</button>
                </div>
                <div id="dokterList"></div>
            </div>
        `;
    }

    async loadDokterData() {
        try {
            const response = await this.apiCall('dokter.php');
            const dokterList = document.getElementById('dokterList');
            
            if (response.data.length === 0) {
                dokterList.innerHTML = '<div class="no-data">Tidak ada data dokter</div>';
                return;
            }

            const html = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Dokter</th>
                                <th>Spesialisasi</th>
                                <th>Poli</th>
                                <th>Telepon</th>
                                <th>Email</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data.map((dokter, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${dokter.nama_dokter}</td>
                                    <td>${dokter.spesialisasi}</td>
                                    <td>${dokter.nama_poli || '-'}</td>
                                    <td>${dokter.no_telepon}</td>
                                    <td>${dokter.email}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="app.editDokter(${dokter.id_dokter})">Edit</button>
                                        <button class="btn btn-danger" onclick="app.deleteDokter(${dokter.id_dokter})">Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            dokterList.innerHTML = html;
        } catch (error) {
            document.getElementById('dokterList').innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    async showDokterForm(dokter = null) {
        const isEdit = !!dokter;
        
        // Load poli data for dropdown
        let poliOptions = '';
        try {
            const poliResponse = await this.apiCall('poli.php');
            poliOptions = poliResponse.data.map(p => 
                `<option value="${p.id_poli}" ${dokter && dokter.id_poli == p.id_poli ? 'selected' : ''}>${p.nama_poli}</option>`
            ).join('');
        } catch (error) {
            poliOptions = '<option value="">Error loading poli</option>';
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 2rem; border-radius: 10px; width: 90%; max-width: 500px;">
                <h3>${isEdit ? 'Edit' : 'Tambah'} Dokter</h3>
                <form id="dokterForm">
                    <input type="hidden" name="id_dokter" value="${dokter ? dokter.id_dokter : ''}">
                    <div class="form-group">
                        <label>Nama Dokter</label>
                        <input type="text" name="nama_dokter" class="form-control" value="${dokter ? dokter.nama_dokter : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Spesialisasi</label>
                        <input type="text" name="spesialisasi" class="form-control" value="${dokter ? dokter.spesialisasi : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Poli</label>
                        <select name="id_poli" class="form-control" required>
                            <option value="">Pilih Poli</option>
                            ${poliOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>No Telepon</label>
                        <input type="text" name="no_telepon" class="form-control" value="${dokter ? dokter.no_telepon : ''}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" class="form-control" value="${dokter ? dokter.email : ''}">
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-danger close-modal">Batal</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = document.getElementById('dokterForm');
        form.addEventListener('submit', (e) => this.handleDokterSubmit(e, isEdit));
    }

    async handleDokterSubmit(e, isEdit) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            nama_dokter: formData.get('nama_dokter'),
            spesialisasi: formData.get('spesialisasi'),
            id_poli: formData.get('id_poli'),
            no_telepon: formData.get('no_telepon'),
            email: formData.get('email')
        };

        if (isEdit) {
            data.id_dokter = formData.get('id_dokter');
        }

        try {
            const endpoint = 'dokter.php';
            const method = isEdit ? 'PUT' : 'POST';
            await this.apiCall(endpoint, method, data);
            this.closeModals();
            this.loadDokterData();
            this.showAlert(`Dokter berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}!`, 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async editDokter(id) {
        try {
            const response = await this.apiCall(`dokter.php?id=${id}`);
            this.showDokterForm(response.data);
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async deleteDokter(id) {
        if (confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
            try {
                await this.apiCall('dokter.php', 'DELETE', { id_dokter: id });
                this.loadDokterData();
                this.showAlert('Dokter berhasil dihapus!', 'success');
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        }
    }

    // ==================== PASIEN ====================
    getPasienHTML() {
        return `
            <div class="section">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="section-title">Data Pasien</h2>
                    <button class="btn btn-primary" onclick="app.showPasienForm()">Tambah Pasien</button>
                </div>
                <div id="pasienList"></div>
            </div>
        `;
    }

    async loadPasienData() {
        try {
            const response = await this.apiCall('pasien.php');
            const pasienList = document.getElementById('pasienList');
            
            if (response.data.length === 0) {
                pasienList.innerHTML = '<div class="no-data">Tidak ada data pasien</div>';
                return;
            }

            const html = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Pasien</th>
                                <th>Tanggal Lahir</th>
                                <th>Jenis Kelamin</th>
                                <th>Telepon</th>
                                <th>Email</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data.map((pasien, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${pasien.nama_pasien}</td>
                                    <td>${pasien.tanggal_lahir}</td>
                                    <td>${pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                                    <td>${pasien.no_telepon}</td>
                                    <td>${pasien.email}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="app.editPasien(${pasien.id_pasien})">Edit</button>
                                        <button class="btn btn-danger" onclick="app.deletePasien(${pasien.id_pasien})">Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            pasienList.innerHTML = html;
        } catch (error) {
            document.getElementById('pasienList').innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    showPasienForm(pasien = null) {
        const isEdit = !!pasien;
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 2rem; border-radius: 10px; width: 90%; max-width: 500px;">
                <h3>${isEdit ? 'Edit' : 'Tambah'} Pasien</h3>
                <form id="pasienForm">
                    <input type="hidden" name="id_pasien" value="${pasien ? pasien.id_pasien : ''}">
                    <div class="form-group">
                        <label>Nama Pasien</label>
                        <input type="text" name="nama_pasien" class="form-control" value="${pasien ? pasien.nama_pasien : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Tanggal Lahir</label>
                        <input type="date" name="tanggal_lahir" class="form-control" value="${pasien ? pasien.tanggal_lahir : ''}">
                    </div>
                    <div class="form-group">
                        <label>Jenis Kelamin</label>
                        <select name="jenis_kelamin" class="form-control" required>
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="L" ${pasien && pasien.jenis_kelamin === 'L' ? 'selected' : ''}>Laki-laki</option>
                            <option value="P" ${pasien && pasien.jenis_kelamin === 'P' ? 'selected' : ''}>Perempuan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Alamat</label>
                        <textarea name="alamat" class="form-control" rows="3">${pasien ? pasien.alamat : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>No Telepon</label>
                        <input type="text" name="no_telepon" class="form-control" value="${pasien ? pasien.no_telepon : ''}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" class="form-control" value="${pasien ? pasien.email : ''}">
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-danger close-modal">Batal</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = document.getElementById('pasienForm');
        form.addEventListener('submit', (e) => this.handlePasienSubmit(e, isEdit));
    }

    async handlePasienSubmit(e, isEdit) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            nama_pasien: formData.get('nama_pasien'),
            tanggal_lahir: formData.get('tanggal_lahir'),
            jenis_kelamin: formData.get('jenis_kelamin'),
            alamat: formData.get('alamat'),
            no_telepon: formData.get('no_telepon'),
            email: formData.get('email')
        };

        if (isEdit) {
            data.id_pasien = formData.get('id_pasien');
        }

        try {
            const endpoint = 'pasien.php';
            const method = isEdit ? 'PUT' : 'POST';
            await this.apiCall(endpoint, method, data);
            this.closeModals();
            this.loadPasienData();
            this.showAlert(`Pasien berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}!`, 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async editPasien(id) {
        try {
            const response = await this.apiCall(`pasien.php?id=${id}`);
            this.showPasienForm(response.data);
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async deletePasien(id) {
        if (confirm('Apakah Anda yakin ingin menghapus pasien ini?')) {
            try {
                await this.apiCall('pasien.php', 'DELETE', { id_pasien: id });
                this.loadPasienData();
                this.showAlert('Pasien berhasil dihapus!', 'success');
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        }
    }

    // ==================== PENDAFTARAN ====================
    getPendaftaranHTML() {
        return `
            <div class="section">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="section-title">Data Pendaftaran</h2>
                    <button class="btn btn-primary" onclick="app.showPendaftaranForm()">Pendaftaran Baru</button>
                </div>
                <div id="pendaftaranList"></div>
            </div>
        `;
    }

    async loadPendaftaranData() {
        try {
            const response = await this.apiCall('pendaftaran.php');
            const pendaftaranList = document.getElementById('pendaftaranList');
            
            if (response.data.length === 0) {
                pendaftaranList.innerHTML = '<div class="no-data">Tidak ada data pendaftaran</div>';
                return;
            }

            const html = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Pasien</th>
                                <th>Dokter</th>
                                <th>Poli</th>
                                <th>Tanggal</th>
                                <th>Keluhan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data.map((daftar, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${daftar.nama_pasien}</td>
                                    <td>${daftar.nama_dokter}</td>
                                    <td>${daftar.nama_poli}</td>
                                    <td>${daftar.tanggal_daftar} ${daftar.jam_daftar}</td>
                                    <td>${daftar.keluhan}</td>
                                    <td><span class="status-badge status-${daftar.status.toLowerCase()}">${daftar.status}</span></td>
                                    <td>
                                        <button class="btn btn-primary" onclick="app.updateStatusPendaftaran(${daftar.id_pendaftaran}, 'Proses')">Proses</button>
                                        <button class="btn btn-success" onclick="app.updateStatusPendaftaran(${daftar.id_pendaftaran}, 'Selesai')">Selesai</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            pendaftaranList.innerHTML = html;
        } catch (error) {
            document.getElementById('pendaftaranList').innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    async showPendaftaranForm() {
        // Load data for dropdowns
        let pasienOptions = '';
        let dokterOptions = '';
        let poliOptions = '';

        try {
            const [pasienResponse, dokterResponse, poliResponse] = await Promise.all([
                this.apiCall('pasien.php'),
                this.apiCall('dokter.php'),
                this.apiCall('poli.php')
            ]);

            pasienOptions = pasienResponse.data.map(p => 
                `<option value="${p.id_pasien}">${p.nama_pasien}</option>`
            ).join('');

            dokterOptions = dokterResponse.data.map(d => 
                `<option value="${d.id_dokter}">${d.nama_dokter} - ${d.spesialisasi}</option>`
            ).join('');

            poliOptions = poliResponse.data.map(p => 
                `<option value="${p.id_poli}">${p.nama_poli}</option>`
            ).join('');

        } catch (error) {
            pasienOptions = '<option value="">Error loading data</option>';
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 2rem; border-radius: 10px; width: 90%; max-width: 500px;">
                <h3>Pendaftaran Baru</h3>
                <form id="pendaftaranForm">
                    <div class="form-group">
                        <label>Pasien</label>
                        <select name="id_pasien" class="form-control" required>
                            <option value="">Pilih Pasien</option>
                            ${pasienOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dokter</label>
                        <select name="id_dokter" class="form-control" required>
                            <option value="">Pilih Dokter</option>
                            ${dokterOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Poli</label>
                        <select name="id_poli" class="form-control" required>
                            <option value="">Pilih Poli</option>
                            ${poliOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tanggal Daftar</label>
                        <input type="date" name="tanggal_daftar" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Jam Daftar</label>
                        <input type="time" name="jam_daftar" class="form-control" value="${new Date().toTimeString().slice(0,5)}" required>
                    </div>
                    <div class="form-group">
                        <label>Keluhan</label>
                        <textarea name="keluhan" class="form-control" rows="3" required></textarea>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-danger close-modal">Batal</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = document.getElementById('pendaftaranForm');
        form.addEventListener('submit', (e) => this.handlePendaftaranSubmit(e));
    }

    async handlePendaftaranSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            id_pasien: formData.get('id_pasien'),
            id_dokter: formData.get('id_dokter'),
            id_poli: formData.get('id_poli'),
            tanggal_daftar: formData.get('tanggal_daftar'),
            jam_daftar: formData.get('jam_daftar'),
            keluhan: formData.get('keluhan')
        };

        try {
            await this.apiCall('pendaftaran.php', 'POST', data);
            this.closeModals();
            this.loadPendaftaranData();
            this.showAlert('Pendaftaran berhasil!', 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async updateStatusPendaftaran(id, status) {
        try {
            await this.apiCall('pendaftaran.php', 'PUT', {
                id_pendaftaran: id,
                status: status
            });
            this.loadPendaftaranData();
            this.showAlert(`Status berhasil diupdate menjadi ${status}!`, 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    // ==================== REKAM MEDIS ====================
    getRekamMedisHTML() {
        return `
            <div class="section">
                <h2 class="section-title">Data Rekam Medis</h2>
                <div id="rekamMedisList"></div>
            </div>
        `;
    }

    async loadRekamMedisData() {
        try {
            const response = await this.apiCall('rekam_medis.php');
            const rekamMedisList = document.getElementById('rekamMedisList');
            
            if (response.data.length === 0) {
                rekamMedisList.innerHTML = '<div class="no-data">Tidak ada data rekam medis</div>';
                return;
            }

            const html = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Pasien</th>
                                <th>Dokter</th>
                                <th>Tanggal Periksa</th>
                                <th>Diagnosa</th>
                                <th>Tindakan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data.map((rm, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${rm.nama_pasien}</td>
                                    <td>${rm.nama_dokter}</td>
                                    <td>${rm.tanggal_periksa}</td>
                                    <td>${rm.diagnosa}</td>
                                    <td>${rm.tindakan}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="app.viewRekamMedis(${rm.id_rekam_medis})">Detail</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            rekamMedisList.innerHTML = html;
        } catch (error) {
            document.getElementById('rekamMedisList').innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    async viewRekamMedis(id) {
        try {
            const response = await this.apiCall(`rekam_medis.php?id=${id}`);
            const rm = response.data;
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;

            let resepHTML = '';
            if (rm.resep_detail && rm.resep_detail.length > 0) {
                resepHTML = `
                    <h4>Resep Obat:</h4>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nama Obat</th>
                                <th>Jumlah</th>
                                <th>Aturan Pakai</th>
                                <th>Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rm.resep_detail.map(resep => `
                                <tr>
                                    <td>${resep.nama_obat}</td>
                                    <td>${resep.jumlah}</td>
                                    <td>${resep.aturan_pakai}</td>
                                    <td>Rp ${parseInt(resep.harga).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }

            modal.innerHTML = `
                <div class="modal-content" style="background: white; padding: 2rem; border-radius: 10px; width: 90%; max-width: 700px; max-height: 80vh; overflow-y: auto;">
                    <h3>Detail Rekam Medis</h3>
                    <div class="card">
                        <p><strong>Pasien:</strong> ${rm.nama_pasien}</p>
                        <p><strong>Dokter:</strong> ${rm.nama_dokter}</p>
                        <p><strong>Tanggal Periksa:</strong> ${rm.tanggal_periksa}</p>
                        <p><strong>Diagnosa:</strong> ${rm.diagnosa}</p>
                        <p><strong>Tindakan:</strong> ${rm.tindakan}</p>
                        <p><strong>Resep Obat:</strong> ${rm.resep_obat}</p>
                    </div>
                    ${resepHTML}
                    <div style="margin-top: 1rem;">
                        <button type="button" class="btn btn-danger close-modal">Tutup</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    // ==================== OBAT ====================
    getObatHTML() {
        return `
            <div class="section">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="section-title">Data Obat</h2>
                    <button class="btn btn-primary" onclick="app.showObatForm()">Tambah Obat</button>
                </div>
                <div id="obatList"></div>
            </div>
        `;
    }

    async loadObatData() {
        try {
            const response = await this.apiCall('obat.php');
            const obatList = document.getElementById('obatList');
            
            if (response.data.length === 0) {
                obatList.innerHTML = '<div class="no-data">Tidak ada data obat</div>';
                return;
            }

            const html = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Obat</th>
                                <th>Jenis</th>
                                <th>Stok</th>
                                <th>Harga</th>
                                <th>Satuan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data.map((obat, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${obat.nama_obat}</td>
                                    <td>${obat.jenis_obat}</td>
                                    <td>${obat.stok}</td>
                                    <td>Rp ${parseInt(obat.harga).toLocaleString()}</td>
                                    <td>${obat.satuan}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="app.editObat(${obat.id_obat})">Edit</button>
                                        <button class="btn btn-danger" onclick="app.deleteObat(${obat.id_obat})">Hapus</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            obatList.innerHTML = html;
        } catch (error) {
            document.getElementById('obatList').innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    showObatForm(obat = null) {
        const isEdit = !!obat;
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="background: white; padding: 2rem; border-radius: 10px; width: 90%; max-width: 500px;">
                <h3>${isEdit ? 'Edit' : 'Tambah'} Obat</h3>
                <form id="obatForm">
                    <input type="hidden" name="id_obat" value="${obat ? obat.id_obat : ''}">
                    <div class="form-group">
                        <label>Nama Obat</label>
                        <input type="text" name="nama_obat" class="form-control" value="${obat ? obat.nama_obat : ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Jenis Obat</label>
                        <input type="text" name="jenis_obat" class="form-control" value="${obat ? obat.jenis_obat : ''}">
                    </div>
                    <div class="form-group">
                        <label>Stok</label>
                        <input type="number" name="stok" class="form-control" value="${obat ? obat.stok : '0'}" required>
                    </div>
                    <div class="form-group">
                        <label>Harga</label>
                        <input type="number" name="harga" class="form-control" value="${obat ? obat.harga : '0'}" required>
                    </div>
                    <div class="form-group">
                        <label>Satuan</label>
                        <input type="text" name="satuan" class="form-control" value="${obat ? obat.satuan : ''}">
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-danger close-modal">Batal</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = document.getElementById('obatForm');
        form.addEventListener('submit', (e) => this.handleObatSubmit(e, isEdit));
    }

    async handleObatSubmit(e, isEdit) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            nama_obat: formData.get('nama_obat'),
            jenis_obat: formData.get('jenis_obat'),
            stok: parseInt(formData.get('stok')),
            harga: parseFloat(formData.get('harga')),
            satuan: formData.get('satuan')
        };

        if (isEdit) {
            data.id_obat = formData.get('id_obat');
        }

        try {
            const endpoint = 'obat.php';
            const method = isEdit ? 'PUT' : 'POST';
            await this.apiCall(endpoint, method, data);
            this.closeModals();
            this.loadObatData();
            this.showAlert(`Obat berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}!`, 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async editObat(id) {
        try {
            const response = await this.apiCall(`obat.php?id=${id}`);
            this.showObatForm(response.data);
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async deleteObat(id) {
        if (confirm('Apakah Anda yakin ingin menghapus obat ini?')) {
            try {
                await this.apiCall('obat.php', 'DELETE', { id_obat: id });
                this.loadObatData();
                this.showAlert('Obat berhasil dihapus!', 'success');
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        }
    }

    // ==================== PEMBAYARAN ====================
    getPembayaranHTML() {
        return `
            <div class="section">
                <h2 class="section-title">Data Pembayaran</h2>
                <div id="pembayaranList"></div>
            </div>
        `;
    }

    async loadPembayaranData() {
        try {
            const response = await this.apiCall('pembayaran.php');
            const pembayaranList = document.getElementById('pembayaranList');
            
            if (response.data.length === 0) {
                pembayaranList.innerHTML = '<div class="no-data">Tidak ada data pembayaran</div>';
                return;
            }

            const html = `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Pasien</th>
                                <th>Dokter</th>
                                <th>Total Biaya</th>
                                <th>Biaya Dokter</th>
                                <th>Biaya Obat</th>
                                <th>Biaya Tindakan</th>
                                <th>Tanggal Bayar</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data.map((bayar, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${bayar.nama_pasien}</td>
                                    <td>${bayar.nama_dokter}</td>
                                    <td>Rp ${parseInt(bayar.total_biaya).toLocaleString()}</td>
                                    <td>Rp ${parseInt(bayar.biaya_dokter).toLocaleString()}</td>
                                    <td>Rp ${parseInt(bayar.biaya_obat).toLocaleString()}</td>
                                    <td>Rp ${parseInt(bayar.biaya_tindakan).toLocaleString()}</td>
                                    <td>${bayar.tanggal_bayar}</td>
                                    <td><span class="status-badge status-${bayar.status_bayar.toLowerCase()}">${bayar.status_bayar}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            pembayaranList.innerHTML = html;
        } catch (error) {
            document.getElementById('pembayaranList').innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    // ==================== UTILITY METHODS ====================
    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `api/${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Terjadi kesalahan');
        }

        return result;
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            color: white;
            z-index: 1001;
            background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    toggleMobileMenu(show = null) {
        const navMenu = document.querySelector('.nav-menu');
        if (show === null) {
            navMenu.classList.toggle('active');
        } else {
            if (show) {
                navMenu.classList.add('active');
            } else {
                navMenu.classList.remove('active');
            }
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KlinikApp();
});