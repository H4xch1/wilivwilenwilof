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

  useEffect(() => {
    if (activePanel === 'laporan-petugas') fetchLaporan();
    if (activePanel === 'siswa-view') fetchSiswa();
  }, [activePanel]);

  const fetchLaporan = async () => {
    try {
      const res = await api.get('/laporan/petugas');
      setLaporanList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSiswa = async () => {
    try {
      const res = await api.get('/users/murid');
      setSiswaList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/laporan/${id}/status`, { status });
      setStatusMessage('Status laporan diperbarui');
      fetchLaporan();
    } catch (err) {
      console.error(err);
    }
  };

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
        {laporanList.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr><th>Tgl Lapor</th><th>Wali Kelas</th><th>Siswa</th><th>Judul</th><th>Deskripsi</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {laporanList.map((lap, i) => (
                <tr key={i}>
                  <td>{new Date(lap.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{lap.walas_id?.nama_lengkap || '-'}</td>
                  <td>{lap.siswa_id?.nama_lengkap || '-'}</td>
                  <td>{lap.judul}</td>
                  <td>{lap.deskripsi}</td>
                  <td>
                    {lap.status === 'belum_dibaca' && <span className="status-badge" style={{ background: '#fef3c7' }}>Belum dibaca</span>}
                    {lap.status === 'dibaca' && <span className="status-badge" style={{ background: '#dbeafe' }}>Dibaca</span>}
                    {lap.status === 'ditindaklanjuti' && <span className="status-badge" style={{ background: '#d1fae5' }}>Ditindaklanjuti</span>}
                  </td>
                  <td>
                    <button className="btn-edit-small" style={{ background: '#3b82f6' }} onClick={() => updateStatus(lap._id, 'dibaca')}>Tandai Dibaca</button>
                    <button className="btn-edit-small" style={{ background: '#10b981' }} onClick={() => updateStatus(lap._id, 'ditindaklanjuti')}>Tindak Lanjuti</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">Belum ada laporan kasus dari wali kelas.</div>
        )}
      </div>
    );
  }

  if (activePanel === 'siswa-view') {
    return (
      <div className="panel active-panel">
        <h2>Data Siswa</h2>
        {siswaList.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Nama</th><th>NIK</th><th>NIS</th></tr>
            </thead>
            <tbody>
              {siswaList.map((s, i) => (
                <tr key={i}>
                  <td>{s._id}</td>
                  <td>{s.nama_lengkap}</td>
                  <td>{s.nik}</td>
                  <td>{s.nis || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">Belum ada data siswa.</div>
        )}
      </div>
    );
  }

  if (activePanel === 'absensi') {
    return (
      <div className="panel active-panel">
        <h2>Absensi Petugas</h2>
        <p>Fitur sedang dalam pengembangan.</p>
      </div>
    );
  }

  return <div className="panel active-panel"><p>Panel tidak ditemukan</p></div>;
}