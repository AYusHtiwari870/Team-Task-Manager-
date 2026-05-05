import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, FolderKanban, Calendar, X } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName]           = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]     = useState(false);
  const { user } = useContext(AuthContext);

  const fetchProjects = async () => {
    const res = await api.get('/projects/');
    setProjects(res.data);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects/', { name, description });
      setShowModal(false);
      setName(''); setDescription('');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating project');
    } finally { setLoading(false); }
  };

  const colorPalette = ['var(--blue)', 'var(--violet)', 'var(--cyan)', 'var(--amber)', 'var(--green)'];
  const getColor = (i) => colorPalette[i % colorPalette.length];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} /> New Project
          </button>
        )}
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FolderKanban size={24}/></div>
          <h3 style={{ marginBottom:'0.5rem', color:'var(--text-2)' }}>No projects yet</h3>
          <p>Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid-cards">
          {projects.map((project, i) => (
            <div key={project._id} className="card animate-slide-up" style={{ animationDelay:`${i * 60}ms`, display:'flex', flexDirection:'column' }}>
              {/* Color accent top strip */}
              <div style={{ height:3, borderRadius:'99px 99px 0 0', background:`linear-gradient(90deg, ${getColor(i)}, transparent)`, margin:'-1.5rem -1.5rem 1.25rem', borderTopLeftRadius:'var(--radius-lg)', borderTopRightRadius:'var(--radius-lg)' }} />

              <div className="card-header">
                <div style={{ width:36, height:36, borderRadius:'var(--radius-sm)', background:`rgba(${i%2===0?'79,140,255':'139,92,246'},0.12)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <FolderKanban size={18} color={getColor(i)} />
                </div>
                <div style={{ flex:1 }}>
                  <div className="card-title">{project.name}</div>
                </div>
              </div>

              <p className="card-desc">{project.description || 'No description provided.'}</p>

              <div className="card-footer">
                <span className="card-meta">
                  <Calendar size={12}/>
                  {new Date(project.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                </span>
                <span className="badge badge-progress" style={{ fontSize:'0.65rem' }}>Active</span>
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
              <h2 className="modal-title" style={{ margin:0 }}>New Project</h2>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:4, display:'flex', borderRadius:'var(--radius-sm)', transition:'all 0.2s' }}>
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" placeholder="e.g. Website Redesign" value={name} onChange={e => setName(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Description <span style={{color:'var(--text-3)', fontWeight:400}}>(optional)</span></label>
                <textarea placeholder="What is this project about?" value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ resize:'vertical', minHeight:80 }} />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={loading}>
                  {loading ? 'Creating…' : <><Plus size={16}/> Create Project</>}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
