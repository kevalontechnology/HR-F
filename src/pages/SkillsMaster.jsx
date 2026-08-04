import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const SkillsMaster = () => {
  const { authFetch } = useAuth();
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'Engineering', description: '' });

  const fetchData = async () => {
    try {
      const res = await authFetch('/api/skills');
      if (res.success) setSkills(res.data || []);
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
      const res = await authFetch('/api/skills', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ name: '', category: 'Engineering', description: '' });
        fetchData();
      } else {
        alert(res.message || 'Failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete skill?')) return;
    try {
      const res = await authFetch(`/api/skills/${id}`, { method: 'DELETE' });
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Skill Name', accessor: 'name', render: s => <span className="font-bold text-erp-primary">{s.name}</span> },
    { header: 'Category', accessor: 'category', render: s => <Badge variant="info">{s.category}</Badge> },
    { header: 'Status', accessor: 'status', render: s => <Badge variant={s.status === 'Active' ? 'success' : 'danger'}>{s.status}</Badge> },
    { header: 'Actions', accessor: '_id', render: s => (
      <button onClick={() => handleDelete(s._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded">
        <Trash2 size={13} />
      </button>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Wrench size={18} /> Technical Skills Master Directory
          </h2>
          <p className="text-xs text-gray-600">Master repository of interviewer & candidate skills.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Skill
        </button>
      </div>

      <DataTable columns={columns} data={skills} searchPlaceholder="Search skills..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Skill Master">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Skill Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. MERN" className="erp-input" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Category</label>
            <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="erp-input" />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Create Skill</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
