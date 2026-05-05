import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card animate-slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">T</div>
          <span className="auth-logo-name">TaskFlow</span>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to your workspace</p>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'var(--radius-sm)', padding:'0.65rem 0.9rem', marginBottom:'1rem', fontSize:'0.83rem', color:'#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>

          <div className="form-group" style={{ position:'relative' }}>
            <label className="form-label">Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingRight:'2.75rem' }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position:'absolute', right:'0.75rem', bottom:'0.65rem', background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:0, display:'flex' }}>
              {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:'0.5rem', padding:'0.75rem' }} disabled={loading}>
            {loading
              ? <span style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.8s linear infinite' }}/> Signing in…</span>
              : <><LogIn size={17}/> Sign In</>
            }
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
