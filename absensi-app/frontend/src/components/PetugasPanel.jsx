import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${token}` }
});

export default function PetugasPanel({ activePanel }) {
  const [laporanList, setLaporanList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data (array)
  const mockLaporan = [
    { _id: '1', tanggal: '2026-05-30', walas_id: { nama_lengkap: 'Bapak Ahmad' }, siswa_id: { nama_lengkap: 'Budi' }, judul: 'Bolos', deskripsi: 'Tidak masuk 3 hari', status: 'belum_dibaca' },
    { _id: '2', tanggal: '2026-05-29', walas_id: { nama_lengkap: 'Ibu Siti' }, siswa_id: { nama_lengkap: 'Ani' }, judul: 'Perilaku', deskripsi: 'Berkelahi', status: 'dibaca' }
  ];
  const mockSiswa = [
    { _id: '1', nama_lengkap: 'Budi Santoso', nik: '1122334455', nis: '12345' },
    { _id: '2', nama_lengkap: 'Siti Aminah', nik: '1122334466', nis: '12346' }
  ];

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/laporan/petugas');
      const data = Array.isArray(res.data) ? res.data : [];
      setLaporanList(data);
    } catch (err) {
      console.error('Gagal ambil laporan, pakai mock', err);
      setLaporanList(mockLaporan);
    }
    setLoading(false);
  };

  const fetchSiswa = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/murid');
      const data = Array.isArray(res.data) ? res.data : [];
      setSiswaList(data);
    } catch (err) {
      console.error('Gagal ambil siswa, pakai mock', err);
      setSiswaList(mockSiswa);
    }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/laporan/${id}/status`, { status });
      setStatusMessage('Status laporan diperbarui');
      fetchLaporan();
    } catch (err) {
      setStatusMessage('Status berhasil diubah (mock)');
      const updated = laporanList.map(l => l._id === id ? { ...l, status } : l);
      setLaporanList(updated);
    }
  };

  useEffect(() => {
    if (activePanel === 'laporan-petugas') fetchLaporan();
    if (activePanel === 'siswa-view') fetchSiswa();
  }, [activePanel]);

  if (activePanel === 'dashboard') {
    return (
      <div className="panel active-panel">
        <div className="welcome-section">
          <h1>👋 Halo, Petugas</h1>
          <p>Kelola laporan kasus dari wali kelas.</p>
        </div>
      </div>
    );
  }

  if (activePanel === 'laporan-petugas') {
    return (
      <div className="panel active-panel">
        <h2><i className="fas fa-inbox"></i> Laporan Kasus dari Wali Kelas</h2>
        {statusMessage && <div className="alert alert-success">{statusMessage}</div>}
        {loading && <div className="alert alert-info">Memuat...</div>}
        {!loading && laporanList.length === 0 && <div className="alert alert-info">Belum ada laporan kasus.</div>}
        {!loading && laporanList.length > 0 && (
          <table className="data-table">
            <thead>
              <tr><th>Tgl Lapor</th><th>Wali Kelas</th><th>Siswa</th><th>Judul</th><th>Deskripsi</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {laporanList.map((lap) => (
                <tr key={lap._id}>
                  <td>{new Date(lap.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{lap.walas_id?.nama_lengkap || '-'}</td>
                  <td>{lap.siswa_id?.nama_lengkap || '-'}</td>
                  <td>{lap.judul}</td>
                  <td>{lap.deskripsi}</td>
                  <td>
                    {lap.status === 'belum_dibaca' && <span className="status-badge" style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '20px' }}>Belum dibaca</span>}
                    {lap.status === 'dibaca' && <span className="status-badge" style={{ background: '#dbeafe', padding: '4px 8px', borderRadius: '20px' }}>Dibaca</span>}
                    {lap.status === 'ditindaklanjuti' && <span className="status-badge" style={{ background: '#d1fae5', padding: '4px 8px', borderRadius: '20px' }}>Ditindaklanjuti</span>}
                  </td>
                  <td>
                    <button className="btn-edit-small" style={{ background: '#3b82f6' }} onClick={() => updateStatus(lap._id, 'dibaca')}>Tandai Dibaca</button>
                    <button className="btn-edit-small" style={{ background: '#10b981' }} onClick={() => updateStatus(lap._id, 'ditindaklanjuti')}>Tindak Lanjuti</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  if (activePanel === 'siswa-view') {
    return (
      <div className="panel active-panel">
        <h2>Data Siswa</h2>
        {loading && <div className="alert alert-info">Memuat...</div>}
        {!loading && siswaList.length === 0 && <div className="alert alert-info">Belum ada data siswa.</div>}
        {!loading && siswaList.length > 0 && (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Nama</th><th>NIK</th><th>NIS</th></tr></thead>
            <tbody>
              {siswaList.map((s) => (
                <tr key={s._id}>
                  <td>{s._id}</td>
                  <td>{s.nama_lengkap}</td>
                  <td>{s.nik}</td>
                  <td>{s.nis || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return <div className="panel active-panel"><p>Panel tidak ditemukan: {activePanel}</p></div>;
}