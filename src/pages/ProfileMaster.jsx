import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const ProfileMaster = () => {
  const { authFetch } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    requiredSkills: [],
    minExperienceYears: 0
  });

  const fetchData = async () => {
    try {
      const pRes = await authFetch('/api/profiles');
      if (pRes.success) setProfiles(pRes.data || []);

      const sRes = await authFetch('/api/skills');
      if (sRes.success) setSkills(sRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/profiles', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ title: '', code: '', description: '', requiredSkills: [], minExperienceYears: 0 });
        fetchData();
      } else {
        alert(res.message || 'Failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete Applied Profile?')) return;
    try {
      const res = await authFetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Profile Title', accessor: 'title', render: p => (
      <div>
        <div className="font-bold text-erp-primary">{p.title}</div>
        <div className="text-[10px] text-gray-500">{p.code}</div>
      </div>
    )},
    { header: 'Required Skills Mapped', accessor: 'requiredSkills', render: p => (
      <div className="flex flex-wrap gap-1">
        {(p.requiredSkills || []).map(s => (
          <span key={s._id} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
            {s.name}
          </span>
        ))}
      </div>
    )},
    { header: 'Min Experience', accessor: 'minExperienceYears', render: p => `${p.minExperienceYears} Years` },
    { header: 'Status', accessor: 'status', render: p => <Badge variant={p.status === 'Active' ? 'success' : 'danger'}>{p.status}</Badge> },
    { header: 'Actions', accessor: '_id', render: p => (
      <button onClick={() => handleDelete(p._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded">
        <Trash2 size={13} />
      </button>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Layers size={18} /> Applied Profile Master Directory
          </h2>
          <p className="text-xs text-gray-600">Configure job profiles and map required skill sets for auto-assignment routing.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Applied Profile
        </button>
      </div>

      <DataTable columns={columns} data={profiles} searchPlaceholder="Search profiles..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Applied Profile">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Profile Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. MERN Stack Developer" className="erp-input" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Unique Profile Code</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g. PROF_MERN" className="erp-input uppercase" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Select Required Skills (Multiple)</label>
            <select
              multiple
              className="erp-select h-28"
              value={formData.requiredSkills}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, requiredSkills: options });
              }}
            >
              {skills.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills.</p>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Create Profile</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
