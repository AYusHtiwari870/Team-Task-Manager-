import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Shield, Users, Trash2, ChevronDown, AlertTriangle, Crown, UserCheck } from 'lucide-react';

export default function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update role');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      setDeleteModal(null);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const memberCount = users.filter(u => u.role === 'Member').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-2)', gap: '0.75rem' }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--blue)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      Loading users…
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={28} style={{ color: 'var(--violet)' }} />
            Admin Dashboard
          </h1>
          <p className="page-subtitle">Manage users, roles, and permissions</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', marginBottom: '1rem',
          fontSize: '0.83rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card violet">
          <div className="stat-icon violet"><Users size={18} /></div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue"><Crown size={18} /></div>
          <div className="stat-value">{adminCount}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><UserCheck size={18} /></div>
          <div className="stat-value">{memberCount}</div>
          <div className="stat-label">Members</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isCurrentUser = u.id === user?.id;
              const initials = u.username.slice(0, 2).toUpperCase();
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: u.role === 'Admin' ? 'var(--grad-primary)' : 'var(--surface-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {u.username} {isCurrentUser && <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>(you)</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{u.email}</td>
                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={isCurrentUser || actionLoading === u.id}
                        style={{
                          appearance: 'none', padding: '0.3rem 1.8rem 0.3rem 0.6rem',
                          fontSize: '0.75rem', borderRadius: '99px', fontWeight: 600,
                          background: u.role === 'Admin' ? 'rgba(139,92,246,0.12)' : 'rgba(6,214,176,0.1)',
                          color: u.role === 'Admin' ? 'var(--violet)' : 'var(--cyan)',
                          border: `1px solid ${u.role === 'Admin' ? 'rgba(139,92,246,0.2)' : 'rgba(6,214,176,0.2)'}`,
                          cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                          opacity: isCurrentUser ? 0.6 : 1, width: 'auto', marginBottom: 0
                        }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                      </select>
                      {!isCurrentUser && (
                        <ChevronDown size={12} style={{
                          position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                          pointerEvents: 'none', color: u.role === 'Admin' ? 'var(--violet)' : 'var(--cyan)'
                        }} />
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!isCurrentUser && (
                      <button
                        onClick={() => setDeleteModal(u)}
                        disabled={actionLoading === u.id}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.35rem 0.75rem', background: 'transparent',
                          border: '1px solid var(--border)', borderRadius: '99px',
                          color: 'var(--text-2)', fontSize: '0.75rem', fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit'
                        }}
                        onMouseEnter={e => { e.target.style.color = 'var(--red)'; e.target.style.borderColor = 'rgba(239,68,68,0.3)'; e.target.style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { e.target.style.color = 'var(--text-2)'; e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'transparent'; }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--red)', flexShrink: 0
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Delete User</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', margin: 0 }}>This action cannot be undone.</p>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '1.25rem' }}>
              Are you sure you want to permanently delete <strong style={{ color: 'var(--text)' }}>{deleteModal.username}</strong> ({deleteModal.email})?
            </p>
            <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button
                className="btn"
                onClick={() => handleDelete(deleteModal.id)}
                disabled={actionLoading === deleteModal.id}
                style={{ background: 'var(--red)', color: 'white', boxShadow: '0 4px 18px rgba(239,68,68,0.3)' }}
              >
                {actionLoading === deleteModal.id ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
