import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FolderKanban, Activity, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [t, p] = await Promise.all([api.get('/tasks/'), api.get('/projects/')]);
        setTasks(t.data);
        setProjects(p.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const done       = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const toDo       = tasks.filter(t => t.status === 'To Do').length;
  const pct        = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const getStatusBadge = (status) => {
    if (status === 'To Do')       return <span className="badge badge-todo">{status}</span>;
    if (status === 'In Progress') return <span className="badge badge-progress">{status}</span>;
    if (status === 'Done')        return <span className="badge badge-done">{status}</span>;
    return <span className="badge">{status}</span>;
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'50vh', color:'var(--text-2)', gap:'0.75rem' }}>
      <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid var(--blue)', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/>
      Loading…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'50vh' }}>
      <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'var(--radius-sm)', padding:'1rem 1.5rem', fontSize:'0.85rem', color:'#f87171' }}>
        {error}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good to see you, <strong style={{color:'var(--text)'}}>{user?.username}</strong> 👋</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card blue animate-slide-up" style={{ animationDelay:'0ms' }}>
          <div className="stat-icon blue"><FolderKanban size={18}/></div>
          <div className="stat-value" style={{ color:'var(--blue)' }}>{projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card violet animate-slide-up" style={{ animationDelay:'60ms' }}>
          <div className="stat-icon violet"><Activity size={18}/></div>
          <div className="stat-value" style={{ color:'var(--violet)' }}>{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card amber animate-slide-up" style={{ animationDelay:'120ms' }}>
          <div className="stat-icon amber"><Clock size={18}/></div>
          <div className="stat-value" style={{ color:'var(--amber)' }}>{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card green animate-slide-up" style={{ animationDelay:'180ms' }}>
          <div className="stat-icon green"><CheckCircle2 size={18}/></div>
          <div className="stat-value" style={{ color:'var(--green)' }}>{done}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="card animate-slide-up" style={{ marginBottom:'1.5rem', animationDelay:'240ms' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <TrendingUp size={16} color="var(--blue)" />
              <span style={{ fontSize:'0.85rem', fontWeight:600 }}>Overall Progress</span>
            </div>
            <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--blue)' }}>{pct}%</span>
          </div>
          <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'var(--grad-primary)', borderRadius:99, transition:'width 0.8s ease' }} />
          </div>
          <div style={{ display:'flex', gap:'1.5rem', marginTop:'0.75rem' }}>
            <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}><span style={{ color:'var(--text-2)' }}>{toDo}</span> To Do</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}><span style={{ color:'var(--amber)' }}>{inProgress}</span> In Progress</span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}><span style={{ color:'var(--green)' }}>{done}</span> Done</span>
          </div>
        </div>
      )}

      {/* Recent Tasks Table */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ fontSize:'1rem', fontWeight:600 }}>Recent Tasks</h2>
        <span style={{ fontSize:'0.75rem', color:'var(--text-3)' }}>Showing last {Math.min(tasks.length, 5)}</span>
      </div>

      <div className="table-wrapper animate-slide-up" style={{ animationDelay:'300ms' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Project</th>
            </tr>
          </thead>
          <tbody>
            {tasks.slice(0, 5).map(task => (
              <tr key={task._id}>
                <td style={{ fontWeight:500 }}>{task.title}</td>
                <td>{getStatusBadge(task.status)}</td>
                <td style={{ color:'var(--text-2)', fontSize:'0.8rem', fontFamily:'monospace' }}>
                  {task.project_id?.slice(-8)}…
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="3">
                  <div className="empty-state" style={{ padding:'2rem' }}>
                    <div className="empty-icon"><Activity size={22}/></div>
                    <p>No tasks yet. Create your first task to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
