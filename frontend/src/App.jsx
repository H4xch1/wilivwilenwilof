import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} 
        />
        <Route 
          path="/dashboard/*" 
          element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;