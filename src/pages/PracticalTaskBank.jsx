import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { FileCode, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const PracticalTaskBank = () => {
  const { authFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    taskTitle: '',
    taskDescription: '',
    profileId: '',
    difficulty: 'Medium',
    expectedTimeMinutes: 45,
    maxMarks: 100
  });

  const fetchData = async () => {
    try {
      const tRes = await authFetch('/api/tasks');
      if (tRes.success) setTasks(tRes.data || []);

      const pRes = await authFetch('/api/profiles');
      if (pRes.success) setProfiles(pRes.data || []);
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
      const res = await authFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ taskTitle: '', taskDescription: '', profileId: '', difficulty: 'Medium', expectedTimeMinutes: 45, maxMarks: 100 });
        fetchData();
      } else {
        alert(res.message || 'Failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete Task?')) return;
    try {
      const res = await authFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Task Title', accessor: 'taskTitle', render: t => <span className="font-bold text-erp-primary">{t.taskTitle}</span> },
    { header: 'Applied Profile', accessor: 'profileId', render: t => t.profileId?.title || 'N/A' },
    { header: 'Expected Time', accessor: 'expectedTimeMinutes', render: t => `${t.expectedTimeMinutes} mins` },
    { header: 'Max Marks', accessor: 'maxMarks', render: t => t.maxMarks },
    { header: 'Actions', accessor: '_id', render: t => (
      <button onClick={() => handleDelete(t._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded">
        <Trash2 size={13} />
      </button>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <FileCode size={18} /> Practical Task Bank Master
          </h2>
          <p className="text-xs text-gray-600">Repository for automated Random 2 Practical Tasks drawer generation.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Practical Task
        </button>
      </div>

      <DataTable columns={columns} data={tasks} searchPlaceholder="Search tasks..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Practical Task">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Task Title</label>
            <input type="text" required value={formData.taskTitle} onChange={e => setFormData({ ...formData, taskTitle: e.target.value })} className="erp-input" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Task Description / Requirements</label>
            <textarea required rows={4} value={formData.taskDescription} onChange={e => setFormData({ ...formData, taskDescription: e.target.value })} className="erp-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Applied Profile</label>
              <select required value={formData.profileId} onChange={e => setFormData({ ...formData, profileId: e.target.value })} className="erp-select">
                <option value="">-- Select Profile --</option>
                {profiles.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Max Marks</label>
              <input type="number" value={formData.maxMarks} onChange={e => setFormData({ ...formData, maxMarks: e.target.value })} className="erp-input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Add Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
