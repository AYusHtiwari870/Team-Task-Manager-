import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, CheckSquare, X } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks]         = useState([]);
  const [projects, setProjects]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask]     = useState({ title: '', description: '', project_id: '' });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([api.get('/tasks/'), api.get('/projects/')]);
      setTasks(tRes.data);
      setProjects(pRes.data);
    } catch (err) {
      console.error('Tasks fetch error:', err);
      setError('Failed to load tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading('create');
    try {
      await api.post('/tasks/', newTask);
      setShowModal(false);
      setNewTask({ title: '', description: '', project_id: '' });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating task');
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      // Optimistic update — no full refetch needed
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.response?.data?.detail || 'Error updating status');
      await fetchData(); // revert on error
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'To Do')       return <span className="badge badge-todo">{status}</span>;
    if (status === 'In Progress') return <span className="badge badge-progress">{status}</span>;
    if (status === 'Done')        return <span className="badge badge-done">{status}</span>;
    return <span className="badge">{status}</span>;
  };

  const getProjectName = (id) => projects.find(p => p._id === id)?.name || id?.slice(-8) || '—';

  const todo       = tasks.filter(t => t.status === 'To Do');
  const inProgress = tasks.filter(t => t.status === 'In Progress');
  const done       = tasks.filter(t => t.status === 'Done');

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
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} · {done.length} completed</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={17}/> New Task
          </button>
        )}
      </div>

      {/* Status Summary Bar */}
      {tasks.length > 0 && (
        <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {[
            { label:'To Do', count:todo.length, cls:'badge-todo' },
            { label:'In Progress', count:inProgress.length, cls:'badge-progress' },
            { label:'Done', count:done.length, cls:'badge-done' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.85rem', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:99, fontSize:'0.8rem' }}>
              <span className={`badge ${s.cls}`} style={{ fontSize:'0.65rem', padding:'0.1rem 0.4rem' }}>{s.count}</span>
              <span style={{ color:'var(--text-2)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Task Grid */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><CheckSquare size={24}/></div>
          <h3 style={{ marginBottom:'0.5rem', color:'var(--text-2)' }}>No tasks yet</h3>
          <p>Create your first task and assign it to a project</p>
        </div>
      ) : (
        <div className="grid-cards">
          {tasks.map((task, i) => (
            <div key={task._id} className="card animate-slide-up" style={{ animationDelay:`${i * 50}ms`, display:'flex', flexDirection:'column' }}>
              <div className="card-header">
                <div style={{ flex:1 }}>
                  <div className="card-title" style={{ marginBottom:'0.25rem' }}>{task.title}</div>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>
                    {getProjectName(task.project_id)}
                  </span>
                </div>
                {getStatusBadge(task.status)}
              </div>

              {task.description && (
                <p className="card-desc">{task.description}</p>
              )}

              <div className="card-footer">
                <select
                  className="status-select"
                  value={task.status}
                  onChange={e => handleStatusChange(task._id, e.target.value)}
                  style={{
                    background: task.status === 'Done' ? 'rgba(34,197,94,0.08)' :
                                task.status === 'In Progress' ? 'rgba(79,140,255,0.08)' :
                                'rgba(100,116,139,0.08)',
                    borderColor: task.status === 'Done' ? 'rgba(34,197,94,0.25)' :
                                 task.status === 'In Progress' ? 'rgba(79,140,255,0.25)' :
                                 'rgba(100,116,139,0.25)',
                    color: task.status === 'Done' ? 'var(--green)' :
                           task.status === 'In Progress' ? 'var(--blue)' :
                           'var(--text-2)',
                  }}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
              <h2 className="modal-title" style={{ margin:0 }}>New Task</h2>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:4, display:'flex', borderRadius:'var(--radius-sm)' }}>
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input type="text" placeholder="e.g. Design landing page" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Description <span style={{color:'var(--text-3)', fontWeight:400}}>(optional)</span></label>
                <textarea placeholder="Add details about this task…" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows="3" style={{ resize:'vertical', minHeight:80 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select value={newTask.project_id} onChange={e => setNewTask({...newTask, project_id: e.target.value})} required>
                  <option value="">— Select a project —</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={actionLoading === 'create'}>
                  {actionLoading === 'create' ? 'Creating…' : <><Plus size={16}/> Create Task</>}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
