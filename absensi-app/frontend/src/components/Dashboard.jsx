import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import AdminPanel from './AdminPanel.jsx';
import WalasPanel from './WalasPanel.jsx';
import PetugasPanel from './PetugasPanel.jsx';
import MuridPanel from './MuridPanel.jsx';

export default function Dashboard({ user, setUser }) {
  const [activePanel, setActivePanel] = useState('dashboard');

  const renderPanel = () => {
    switch (user.role) {
      case 'admin': return <AdminPanel activePanel={activePanel} />;
      case 'walas': return <WalasPanel activePanel={activePanel} />;
      case 'petugas': return <PetugasPanel activePanel={activePanel} />;
      case 'murid': return <MuridPanel activePanel={activePanel} />;
      default: return <div>Role tidak dikenal</div>;
    }
  };

  const panelTitles = {
    dashboard: 'Dashboard',
    account: 'Account',
    'siswa-view': 'Data Siswa',
    'petugas-view': 'Data Petugas',
    'walas-view': 'Data Wali Kelas',
    'admin-view': 'Data Admin',
    'register-siswa': 'Register Siswa',
    'manage-siswa': 'Manage Siswa',
    'register-petugas': 'Register Petugas',
    'manage-petugas': 'Manage Petugas',
    'register-walas': 'Register Wali Kelas',
    'manage-walas': 'Manage Wali Kelas',
    'register-admin': 'Register Admin',
    'manage-admin': 'Manage Admin',
    'siswa-bimbingan': 'Siswa Bimbingan',
    'absensi-walas': 'Rekap Absensi',
    'kirim-laporan': 'Kirim Laporan Kasus',
    'riwayat-laporan': 'Riwayat Laporan',
    'profil-walas': 'Profil Saya',
    absensi: 'Absensi Hari Ini',
    'laporan-petugas': 'Laporan Kasus dari Walas',
    'absen-form': 'Form Absensi',
    'riwayat-absen': 'Riwayat Absensi',
    profil: 'Profil Saya',
  };

  return (
    <div>
      <Sidebar user={user} activePanel={activePanel} setActivePanel={setActivePanel} />
      <div className="main-content">
        <div className="top-bar">
          <div className="page-title" id="page-title">{panelTitles[activePanel] || 'Dashboard'}</div>
          <div className="user-info">
            <span><i className="fas fa-user-astronaut"></i> {user.nama}</span>
            <button className="logout-btn" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              window.location.href = '/login';
            }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
        <div className="content-area">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}