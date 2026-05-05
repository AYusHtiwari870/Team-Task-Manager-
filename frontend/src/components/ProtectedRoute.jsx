import React, { useContext } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { LogOut } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-2)', gap:'0.75rem' }}>
      <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid var(--blue)', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
      Loading…
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleBadge = user.role === 'Admin' ? 'badge badge-admin' : 'badge badge-member';
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">Team Task Manager</span>
          <div className="topbar-actions">
            <div className="topbar-user">
              <div className="topbar-avatar">{initials}</div>
              <span style={{ fontSize:'0.8rem', fontWeight:500 }}>{user.username}</span>
              <span className={roleBadge} style={{ fontSize:'0.65rem', padding:'0.15rem 0.5rem' }}>{user.role}</span>
            </div>
            <button className="topbar-logout" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
        <div className="content-area animate-fade-in">
          <Outlet />
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
