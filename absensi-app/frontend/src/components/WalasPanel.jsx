import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
  headers: { Authorization: `Bearer ${token}` }
});

export default function WalasPanel({ activePanel }) {
  const [siswaList, setSiswaList] = useState([]);
  const [laporanMessage, setLaporanMessage] = useState('');
  const [riwayatLaporan, setRiwayatLaporan] = useState([]);
  const [absensiSiswa, setAbsensiSiswa] = useState([]);
  const [viewingSiswa, setViewingSiswa] = useState(null);

  useEffect(() => {
    fetchSiswaBimbingan();
  }, []);

  useEffect(() => {
    if (activePanel === 'riwayat-laporan') fetchRiwayatLaporan();
  }, [activePanel]);

  const fetchSiswaBimbingan = async () => {
    try {
      const res = await api.get('/users/murid');
      setSiswaList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRiwayatLaporan = async () => {
    try {
      const res = await api.get('/laporan/walas');
      setRiwayatLaporan(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKirimLaporan = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const res = await api.post('/laporan', {
        siswa_id: formData.get('siswa_id'),
        judul: formData.get('judul'),
        deskripsi: formData.get('deskripsi')
      });
      setLaporanMessage(res.data.message);
      e.target.reset();
    } catch (err) {
      setLaporanMessage(err.response?.data?.message || 'Gagal mengirim laporan');
    }
  };

  const handleLihatAbsensi = async (siswaId) => {
    try {
      const res = await api.get(`/absensi/walas/${siswaId}`);
      setAbsensiSiswa(res.data);
      const siswa = siswaList.find(s => s._id === siswaId);
      setViewingSiswa(siswa);
    } catch (err) {
      console.error(err);
    }
  };

  if (activePanel === 'dashboard') {
    return (
      <div className="panel active-panel">
        <div className="welcome-section">
          <h1>👋 Halo Wali Kelas</h1>
          <p>Pantau siswa dan kirim laporan kasus.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Siswa Bimbingan</h3>
              <div className="number">{siswaList.length}</div>
            </div>
            <i className="fas fa-users stat-icon"></i>
          </div>
        </div>
      </div>
    );
  }

  if (activePanel === 'siswa-bimbingan') {
    return (
      <div className="panel active-panel">
        <h2>Siswa Bimbingan</h2>
        {siswaList.map(siswa => (
          <div key={siswa._id} style={{ background: '#f1f5f9', padding: '12px', borderRadius: '20px', marginBottom: '10px' }}>
            <strong>{siswa.nama_lengkap}</strong> (NIS: {siswa.nis || '-'})
            <br />
            <button className="btn-edit-small" onClick={() => handleLihatAbsensi(siswa._id)}>Lihat Absensi</button>
          </div>
        ))}
      </div>
    );
  }

  if (activePanel === 'absensi-walas') {
    return (
      <div className="panel active-panel">
        <h2>Rekap Absensi</h2>
        {viewingSiswa ? (
          <>
            <div className="alert alert-info">Siswa: {viewingSiswa.nama_lengkap}</div>
            {absensiSiswa.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr><th>Tanggal</th><th>Status</th><th>Foto</th></tr>
                </thead>
                <tbody>
                  {absensiSiswa.map((a, i) => (
                    <tr key={i}>
                      <td>{a.tanggal}</td>
                      <td><span className={`status-badge status-${a.status}`}>{a.status}</span></td>
                      <td>{a.foto_kamera ? <a href={`${API_URL.replace('/api', '')}/${a.foto_kamera}`} target="_blank">Lihat</a> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="alert alert-info">Belum ada data absensi.</div>
            )}
          </>
        ) : (
          <div className="alert alert-info">Pilih siswa dari menu Siswa Bimbingan.</div>
        )}
      </div>
    );
  }

  if (activePanel === 'kirim-laporan') {
    return (
      <div className="panel active-panel">
        <h2><i className="fas fa-exclamation-triangle"></i> Kirim Laporan Kasus Siswa</h2>
        {laporanMessage && <div className="alert alert-success">{laporanMessage}</div>}
        <form onSubmit={handleKirimLaporan}>
          <div className="form-group">
            <label>Pilih Siswa</label>
            <select name="siswa_id" required>
              <option value="">-- Pilih Siswa Bimbingan --</option>
              {siswaList.map(s => (
                <option key={s._id} value={s._id}>{s.nama_lengkap} (NIS: {s.nis || '-'})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Judul Laporan</label>
            <input type="text" name="judul" placeholder="Contoh: Bolos, Perilaku, dll" required />
          </div>
          <div className="form-group">
            <label>Deskripsi Lengkap</label>
            <textarea name="deskripsi" rows="4" placeholder="Jelaskan kronologi, bukti, dll..." required></textarea>
          </div>
          <button type="submit" className="btn-submit"><i className="fas fa-paper-plane"></i> Kirim ke Petugas</button>
        </form>
      </div>
    );
  }

  if (activePanel === 'riwayat-laporan') {
    return (
      <div className="panel active-panel">
        <h2><i className="fas fa-list"></i> Riwayat Laporan Kasus</h2>
        {riwayatLaporan.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr><th>Tanggal</th><th>Siswa</th><th>Judul</th><th>Deskripsi</th><th>Status</th></tr>
            </thead>
            <tbody>
              {riwayatLaporan.map((lap, i) => (
                <tr key={i}>
                  <td>{new Date(lap.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{lap.siswa_id?.nama_lengkap || '-'}</td>
                  <td>{lap.judul}</td>
                  <td>{lap.deskripsi}</td>
                  <td>
                    {lap.status === 'belum_dibaca' && <span style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '20px' }}>Belum dibaca</span>}
                    {lap.status === 'dibaca' && <span style={{ background: '#dbeafe', padding: '4px 8px', borderRadius: '20px' }}>Sudah dibaca</span>}
                    {lap.status === 'ditindaklanjuti' && <span style={{ background: '#d1fae5', padding: '4px 8px', borderRadius: '20px' }}>Ditindaklanjuti</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info">Belum ada laporan yang dikirim.</div>
        )}
      </div>
    );
  }

  if (activePanel === 'profil-walas') {
    return (
      <div className="panel active-panel">
        <h2>Profil Wali Kelas</h2>
        <table className="data-table">
          <tbody>
            <tr><th>Nama</th><td>{JSON.parse(localStorage.getItem('user'))?.nama}</td></tr>
            <tr><th>NIK</th><td>{JSON.parse(localStorage.getItem('user'))?.nik}</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="panel active-panel"><p>Panel tidak ditemukan</p></div>;
}