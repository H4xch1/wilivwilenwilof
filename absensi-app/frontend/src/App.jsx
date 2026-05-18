import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#86efac] flex flex-col items-center justify-center p-4 font-sans">
      {/* Logo Sekolah (Pake placeholder dulu, ntar bisa lu ganti) */}
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-4 overflow-hidden border-2 border-yellow-400">
        <span className="text-xs font-bold text-gray-400 text-center px-1">Logo SMK CN</span>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-wide">Absensi Siswa</h1>

      {/* Login Card sesuai mockup lu */}
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Masukkan NISN Dan Password</h2>
        
        {/* Input NISN */}
        <div className="text-left mb-4">
          <label className="text-sm font-medium text-gray-600">NISN</label>
          <input 
            type="text" 
            placeholder="Masukkan NISN kamu..."
            className="w-full bg-[#d1d5db] rounded-lg h-12 px-4 mt-1 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" 
          />
        </div>

        {/* Input Password */}
        <div className="text-left mb-8">
          <label className="text-sm font-medium text-gray-600">Password</label>
          <input 
            type="password" 
            placeholder="Masukkan Password..."
            className="w-full bg-[#d1d5db] rounded-lg h-12 px-4 mt-1 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" 
          />
        </div>

        {/* Tombol Login Biru */}
        <button className="w-full bg-[#1d4ed8] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-md">
          Login
        </button>
      </div>
    </div>
  );
}