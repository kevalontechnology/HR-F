import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { FileCode, Plus, Trash2, Edit, CheckSquare, Layers } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const PracticalTaskBank = () => {
  const { authFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkProfileId, setBulkProfileId] = useState('');
  const [bulkDifficulty, setBulkDifficulty] = useState('');

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

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(tasks.map(t => t._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkUpdate = async (updateData, fieldLabel) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apply bulk update for ${selectedIds.length} selected tasks (${fieldLabel})?`)) return;

    try {
      const res = await authFetch('/api/tasks/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, updateData })
      });

      if (res.success) {
        alert(res.message);
        setSelectedIds([]);
        setBulkProfileId('');
        setBulkDifficulty('');
        fetchData();
      } else {
        alert(res.message || 'Bulk update failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected practical tasks permanently?`)) return;

    try {
      const res = await authFetch('/api/tasks/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds })
      });

      if (res.success) {
        alert(res.message);
        setSelectedIds([]);
        fetchData();
      } else {
        alert(res.message || 'Bulk delete failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/tasks/${editingId}` : '/api/tasks';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.success) {
        setIsModalOpen(false);
        setEditingId(null);
        resetForm();
        fetchData();
      } else {
        alert(res.message || 'Operation failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      taskTitle: '',
      taskDescription: '',
      profileId: profiles[0]?._id || '',
      difficulty: 'Medium',
      expectedTimeMinutes: 45,
      maxMarks: 100
    });
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setFormData({
      taskTitle: t.taskTitle,
      taskDescription: t.taskDescription,
      profileId: t.profileId?._id || t.profileId,
      difficulty: t.difficulty || 'Medium',
      expectedTimeMinutes: t.expectedTimeMinutes || 45,
      maxMarks: t.maxMarks || 100
    });
    setIsModalOpen(true);
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
    {
      header: (
        <input
          type="checkbox"
          checked={tasks.length > 0 && selectedIds.length === tasks.length}
          onChange={toggleSelectAll}
          className="rounded text-erp-primary"
        />
      ),
      accessor: '_id',
      width: '40px',
      render: t => (
        <input
          type="checkbox"
          checked={selectedIds.includes(t._id)}
          onChange={() => toggleSelectRow(t._id)}
          className="rounded text-erp-primary"
        />
      )
    },
    { header: 'Task Title', accessor: 'taskTitle', render: t => <span className="font-bold text-erp-primary">{t.taskTitle}</span> },
    { header: 'Applied Profile', accessor: 'profileId', render: t => t.profileId?.title || 'N/A' },
    { header: 'Expected Time', accessor: 'expectedTimeMinutes', render: t => `${t.expectedTimeMinutes} mins` },
    { header: 'Max Marks', accessor: 'maxMarks', render: t => t.maxMarks },
    { header: 'Actions', accessor: '_id', render: t => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleEdit(t)} className="p-1 border text-erp-primary hover:bg-gray-100 rounded" title="Edit Task">
          <Edit size={13} />
        </button>
        <button onClick={() => handleDelete(t._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded" title="Delete Task">
          <Trash2 size={13} />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <FileCode size={18} /> Practical Task Bank & Bulk Controller
          </h2>
          <p className="text-xs text-gray-600">Select multiple tasks to bulk update profiles, difficulty levels, or delete.</p>
        </div>
        <button onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Practical Task
        </button>
      </div>

      {/* Bulk Actions Toolbar Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-purple-50 border border-purple-300 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-purple-900">
            <CheckSquare size={16} />
            <span>{selectedIds.length} Practical Tasks Selected for Bulk Edit</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Profile Update */}
            <div className="flex items-center gap-1">
              <select
                value={bulkProfileId}
                onChange={e => {
                  setBulkProfileId(e.target.value);
                  if (e.target.value) handleBulkUpdate({ profileId: e.target.value }, 'Applied Profile');
                }}
                className="erp-select text-xs font-semibold bg-white"
              >
                <option value="">-- Bulk Change Profile --</option>
                {profiles.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>

            {/* Bulk Difficulty Update */}
            <div className="flex items-center gap-1">
              <select
                value={bulkDifficulty}
                onChange={e => {
                  setBulkDifficulty(e.target.value);
                  if (e.target.value) handleBulkUpdate({ difficulty: e.target.value }, 'Difficulty Level');
                }}
                className="erp-select text-xs font-semibold bg-white"
              >
                <option value="">-- Bulk Difficulty --</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Bulk Delete */}
            <button
              onClick={handleBulkDelete}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-xs font-bold flex items-center gap-1 text-xs"
            >
              <Trash2 size={13} /> Bulk Delete ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Tasks Data Table */}
      <DataTable columns={columns} data={tasks} searchPlaceholder="Search tasks..." />

      {/* Add / Edit Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Practical Task" : "Create Practical Task"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Task Title *</label>
            <input type="text" required value={formData.taskTitle} onChange={e => setFormData({ ...formData, taskTitle: e.target.value })} className="erp-input" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Task Description / Requirements *</label>
            <textarea required rows={4} value={formData.taskDescription} onChange={e => setFormData({ ...formData, taskDescription: e.target.value })} className="erp-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Applied Profile *</label>
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
            <button type="submit" className="btn-erp-primary">{editingId ? "Save Task Changes" : "Add Task"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
