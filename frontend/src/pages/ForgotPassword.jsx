import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Something went wrong. Please try again.');
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

        {sent ? (
          /* Success State */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--radius)', margin: '0 auto 1.25rem',
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)'
            }}>
              <Mail size={24} />
            </div>
            <h1 className="auth-heading" style={{ fontSize: '1.3rem' }}>Check your email</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              If an account exists with <strong style={{ color: 'var(--text)' }}>{email}</strong>, we've sent a password reset link. Check your inbox (and spam folder).
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
              💡 For local development, check your backend terminal logs for the reset link.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          /* Form State */
          <>
            <h1 className="auth-heading">Forgot password?</h1>
            <p className="auth-subheading">Enter your email and we'll send you a reset link</p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#f87171' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} /> Sending…</span>
                  : <><Send size={16} /> Send Reset Link</>
                }
              </button>
            </form>

            <p className="auth-footer">
              Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
