import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${token}` }
});

export default function AdminPanel({ activePanel }) {
  const [stats, setStats] = useState({ siswa: 0, petugas: 0, walas: 0, admin: 0 });
  const [chartData, setChartData] = useState({ labels: ['Hadir', 'Sakit', 'Izin'], data: [0, 0, 0] });
  const [users, setUsers] = useState([]);
  const [walasList, setWalasList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState('');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchStats = async () => {
    try {
      const [siswa, petugas, walas, admin] = await Promise.all([
        api.get('/users/murid'),
        api.get('/users/petugas'),
        api.get('/users/walas'),
        api.get('/users/admin')
      ]);
      setStats({
        siswa: Array.isArray(siswa.data) ? siswa.data.length : 0,
        petugas: Array.isArray(petugas.data) ? petugas.data.length : 0,
        walas: Array.isArray(walas.data) ? walas.data.length : 0,
        admin: Array.isArray(admin.data) ? admin.data.length : 0
      });
    } catch (err) {
      console.error('Gagal ambil statistik', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await api.get('/absensi/statistik/bulan-ini');
      if (res.data && res.data.labels && res.data.data) {
        setChartData(res.data);
      }
    } catch (err) {
      console.error('Gagal ambil data chart', err);
    }
  };

  const fetchUsers = async (role) => {
    try {
      const res = await api.get(`/users/${role}`);
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        console.warn(`Data ${role} bukan array:`, res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error(`Gagal ambil data ${role}`, err);
      setUsers([]);
    }
  };

  const fetchWalas = async () => {
    try {
      const res = await api.get('/users/list/walas');
      if (Array.isArray(res.data)) {
        setWalasList(res.data);
      } else {
        setWalasList([]);
      }
    } catch (err) {
      console.error('Gagal ambil data wali kelas', err);
      setWalasList([]);
    }
  };

  useEffect(() => {
    if (activePanel === 'dashboard') {
      fetchStats();
      fetchChartData();
    }
    if (activePanel.includes('view') || activePanel.includes('manage')) {
      let role = '';
      if (activePanel === 'siswa-view' || activePanel === 'manage-siswa') role = 'murid';
      else if (activePanel === 'petugas-view' || activePanel === 'manage-petugas') role = 'petugas';
      else if (activePanel === 'walas-view' || activePanel === 'manage-walas') role = 'walas';
      else if (activePanel === 'admin-view' || activePanel === 'manage-admin') role = 'admin';
      if (role) fetchUsers(role);
    }
    if (activePanel.includes('register')) fetchWalas();
  }, [activePanel]);

  useEffect(() => {
    if (activePanel === 'dashboard' && chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Kehadiran',
            data: chartData.data,
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
            borderRadius: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [chartData, activePanel]);

  const handleRegister = async (e, role) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nama: formData.get('nama'),
      nik: formData.get('nik'),
      nis: formData.get('nis') || null,
      tanggal_lahir: formData.get('tanggal_lahir') || null,
      password: formData.get('password'),
      role: role,
      wali_kelas_id: formData.get('wali_kelas_id') || null
    };
    try {
      const res = await api.post('/auth/register', data);
      setMessage(res.data.message);
      e.target.reset();
      if (activePanel.includes('register')) fetchWalas();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal mendaftarkan');
    }
  };

  const handleDelete = async (id, role) => {
    if (!confirm('Yakin ingin menghapus?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(role);
      setMessage('Data berhasil dihapus');
    } catch (err) {
      console.error(err);
      setMessage('Gagal menghapus');
    }
  };

  const openEdit = (user) => {
    setEditData(user);
    setEditModalOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nama: formData.get('nama_edit'),
      nik: formData.get('nik_edit'),
      nis: formData.get('nis_edit') || null,
      tanggal_lahir: formData.get('tanggal_lahir_edit') || null,
      role: formData.get('role_edit'),
      wali_kelas_id: formData.get('wali_kelas_id_edit') || null,
      password: formData.get('password_edit') || undefined
    };
    try {
      await api.put(`/users/${editData._id}`, data);
      setMessage('Data berhasil diupdate');
      setEditModalOpen(false);
      let role = '';
      if (activePanel === 'manage-siswa') role = 'murid';
      else if (activePanel === 'manage-petugas') role = 'petugas';
      else if (activePanel === 'manage-walas') role = 'walas';
      else if (activePanel === 'manage-admin') role = 'admin';
      if (role) fetchUsers(role);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal mengupdate');
    }
  };

  // DASHBOARD
  if (activePanel === 'dashboard') {
    return (
      <div className="panel active-panel">
        <div className="welcome-section">
          <h1>👋 Halo, {JSON.parse(localStorage.getItem('user'))?.nama}</h1>
          <p>Kelola semua data sekolah.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-info"><h3>Siswa</h3><div className="number">{stats.siswa}</div></div><i className="fas fa-user-graduate stat-icon"></i></div>
          <div className="stat-card"><div className="stat-info"><h3>Petugas</h3><div className="number">{stats.petugas}</div></div><i className="fas fa-chalkboard stat-icon"></i></div>
          <div className="stat-card"><div className="stat-info"><h3>Wali Kelas</h3><div className="number">{stats.walas}</div></div><i className="fas fa-chalkboard-user stat-icon"></i></div>
          <div className="stat-card"><div className="stat-info"><h3>Admin</h3><div className="number">{stats.admin}</div></div><i className="fas fa-user-shield stat-icon"></i></div>
        </div>
        <div className="stat-card">
          <h3>📊 Grafik Kehadiran Bulan Ini</h3>
          <div style={{ maxHeight: '280px' }}><canvas ref={chartRef}></canvas></div>
        </div>
      </div>
    );
  }

  // ACCOUNT
  if (activePanel === 'account') {
    return (
      <div className="panel active-panel">
        <h2>Account</h2>
        <p>Informasi akun admin akan ditampilkan di sini.</p>
      </div>
    );
  }

  // RENDER VIEW PANEL (aman terhadap users bukan array)
  const renderViewPanel = (title, role) => {
    // Pastikan users adalah array
    const safeUsers = Array.isArray(users) ? users : [];
    return (
      <div className="panel active-panel">
        <h2>{title}</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {safeUsers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Nama</th><th>NIK</th>{role === 'murid' && <th>NIS</th>}<th>Tgl Lahir</th></tr>
            </thead>
            <tbody>
              {safeUsers.map((u, i) => (
                <tr key={i}>
                  <td>{u._id}</td>
                  <td>{u.nama_lengkap}</td>
                  <td>{u.nik}</td>
                  {role === 'murid' && <td>{u.nis || '-'}</td>}
                  <td>{u.tanggal_lahir ? new Date(u.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">Belum ada data.</div>
        )}
      </div>
    );
  };

  if (activePanel === 'siswa-view') return renderViewPanel('Data Siswa', 'murid');
  if (activePanel === 'petugas-view') return renderViewPanel('Data Petugas', 'petugas');
  if (activePanel === 'walas-view') return renderViewPanel('Data Wali Kelas', 'walas');
  if (activePanel === 'admin-view') return renderViewPanel('Data Admin', 'admin');

  // RENDER MANAGE PANEL (aman)
  const renderManagePanel = (title, role) => {
    const safeUsers = Array.isArray(users) ? users : [];
    return (
      <div className="panel active-panel">
        <h2>{title}</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {safeUsers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Nama</th><th>NIK</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {safeUsers.map((u, i) => (
                <tr key={i}>
                  <td>{u._id}</td>
                  <td>{u.nama_lengkap}</td>
                  <td>{u.nik}</td>
                  <td>
                    <button className="btn-edit-small" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(u._id, role)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">Belum ada data.</div>
        )}
      </div>
    );
  };

  if (activePanel === 'manage-siswa') return renderManagePanel('Manage Siswa', 'murid');
  if (activePanel === 'manage-petugas') return renderManagePanel('Manage Petugas', 'petugas');
  if (activePanel === 'manage-walas') return renderManagePanel('Manage Wali Kelas', 'walas');
  if (activePanel === 'manage-admin') return renderManagePanel('Manage Admin', 'admin');

  // RENDER REGISTER PANEL
  const renderRegisterPanel = (title, role) => (
    <div className="panel active-panel">
      <h2>{title}</h2>
      {message && <div className="alert alert-success">{message}</div>}
      <form onSubmit={(e) => handleRegister(e, role)}>
        <div className="form-group"><label>Nama Lengkap</label><input type="text" name="nama" required /></div>
        <div className="form-group"><label>NIK</label><input type="text" name="nik" required /></div>
        {role === 'murid' && (
          <>
            <div className="form-group"><label>NIS</label><input type="text" name="nis" /></div>
            <div className="form-group"><label>Tanggal Lahir</label><input type="date" name="tanggal_lahir" /></div>
            <div className="form-group">
              <label>Wali Kelas</label>
              <select name="wali_kelas_id">
                <option value="">-- Tidak punya --</option>
                {walasList.map(w => <option key={w._id} value={w._id}>{w.nama_lengkap}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="form-group"><label>Password</label><input type="password" name="password" required /></div>
        <button type="submit" className="btn-submit">Daftar</button>
      </form>
    </div>
  );

  if (activePanel === 'register-siswa') return renderRegisterPanel('Register Siswa', 'murid');
  if (activePanel === 'register-petugas') return renderRegisterPanel('Register Petugas', 'petugas');
  if (activePanel === 'register-walas') return renderRegisterPanel('Register Wali Kelas', 'walas');
  if (activePanel === 'register-admin') return renderRegisterPanel('Register Admin', 'admin');

  // MODAL EDIT
  if (editModalOpen) {
    const safeWalas = Array.isArray(walasList) ? walasList : [];
    return (
      <>
        <div className="panel active-panel" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <div>Loading...</div>
        </div>
        <div className="modal active">
          <div className="modal-content">
            <span className="close-modal" onClick={() => setEditModalOpen(false)}>&times;</span>
            <h3>Edit Data</h3>
            <form onSubmit={handleEdit}>
              <input type="hidden" name="id_edit" value={editData._id} />
              <div className="form-group"><label>Nama</label><input type="text" name="nama_edit" defaultValue={editData.nama_lengkap} required /></div>
              <div className="form-group"><label>NIK</label><input type="text" name="nik_edit" defaultValue={editData.nik} required /></div>
              <div className="form-group"><label>NIS</label><input type="text" name="nis_edit" defaultValue={editData.nis || ''} /></div>
              <div className="form-group"><label>Tgl Lahir</label><input type="date" name="tanggal_lahir_edit" defaultValue={editData.tanggal_lahir ? editData.tanggal_lahir.split('T')[0] : ''} /></div>
              <div className="form-group"><label>Role</label>
                <select name="role_edit" defaultValue={editData.role}>
                  <option value="murid">Siswa</option><option value="petugas">Petugas</option><option value="walas">Wali Kelas</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group" style={{ display: editData.role === 'murid' ? 'block' : 'none' }}>
                <label>Wali Kelas</label>
                <select name="wali_kelas_id_edit" defaultValue={editData.wali_kelas_id || ''}>
                  <option value="">-- Tidak punya --</option>
                  {safeWalas.map(w => <option key={w._id} value={w._id}>{w.nama_lengkap}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Password (kosongkan jika tidak diubah)</label><input type="password" name="password_edit" /></div>
              <button type="submit" className="btn-submit">Simpan</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return <div className="panel active-panel"><p>Panel tidak ditemukan: {activePanel}</p></div>;
}