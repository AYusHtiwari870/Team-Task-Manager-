import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-bg">
        <div className="auth-card animate-slide-up" style={{ textAlign: 'center' }}>
          <div className="auth-logo">
            <div className="auth-logo-icon">T</div>
            <span className="auth-logo-name">TaskFlow</span>
          </div>
          <h1 className="auth-heading" style={{ fontSize: '1.3rem' }}>Invalid Link</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>
            This reset link is invalid or missing a token. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', textDecoration: 'none' }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg">
      <div className="auth-card animate-slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">T</div>
          <span className="auth-logo-name">TaskFlow</span>
        </div>

        {success ? (
          /* Success State */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--radius)', margin: '0 auto 1.25rem',
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)'
            }}>
              <CheckCircle size={24} />
            </div>
            <h1 className="auth-heading" style={{ fontSize: '1.3rem' }}>Password Reset!</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.5rem' }}>
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Go to Login
            </Link>
          </div>
        ) : (
          /* Form State */
          <>
            <h1 className="auth-heading">Reset password</h1>
            <p className="auth-subheading">Enter your new password below</p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#f87171' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">New Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: '0.75rem', bottom: '0.65rem', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} /> Resetting…</span>
                  : <><Lock size={16} /> Reset Password</>
                }
              </button>
            </form>

            <p className="auth-footer">
              <Link to="/login" className="auth-link"><ArrowLeft size={13} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />Back to login</Link>
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
