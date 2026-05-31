import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login({ setUser }) {
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // GANTI KODE YANG LAMA MENJADI SEPERTI INI:
      const res = await axios.post(`http://localhost:5000/api/auth/login`, { nik, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #66ea66 0%, #3f9245 100%)',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        maxWidth: '1000px',
        width: '100%',
        background: 'white',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{
          flex: 1,
          background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2995/2995435.png" alt="Login" style={{ width: '200px', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '0.5rem' }}>Selamat Datang!</h2>
          <p style={{ color: '#475569' }}>Masuk ke dashboard<br />Sistem Absensi Cerdas</p>
        </div>
        <div style={{ flex: 1, padding: '3rem' }}>
          <h1 style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #66ea66 0%, #3f9245)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            <i className="fas fa-graduation-cap"></i> Login
          </h1>
          <p style={{ marginBottom: '2rem' }}>Masukkan NIK dan password Anda</p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <i className="fas fa-exclamation-triangle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="fas fa-id-card"></i> NIK</label>
              <input type="text" value={nik} onChange={(e) => setNik(e.target.value)} placeholder="Masukkan NIK" required autoFocus />
            </div>
            <div className="form-group">
              <label><i className="fas fa-lock"></i> Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Loading...' : <><i className="fas fa-arrow-right-to-bracket"></i> Masuk</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}