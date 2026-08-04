import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { HelpCircle, Plus, Trash2, Edit, CheckSquare, Layers, Wrench, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const TechnicalQuestionBank = () => {
  const { authFetch } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkProfileId, setBulkProfileId] = useState('');
  const [bulkSkillId, setBulkSkillId] = useState('');
  const [bulkDifficulty, setBulkDifficulty] = useState('');

  const [formData, setFormData] = useState({
    questionText: '',
    profileId: '',
    skillId: '',
    difficulty: 'Medium',
    expectedAnswer: ''
  });

  const fetchData = async () => {
    try {
      const qRes = await authFetch('/api/questions');
      if (qRes.success) setQuestions(qRes.data || []);

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

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(questions.map(q => q._id));
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
    if (!confirm(`Apply bulk update for ${selectedIds.length} selected questions (${fieldLabel})?`)) return;

    try {
      const res = await authFetch('/api/questions/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds, updateData })
      });

      if (res.success) {
        alert(res.message);
        setSelectedIds([]);
        setBulkProfileId('');
        setBulkSkillId('');
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
    if (!confirm(`Delete ${selectedIds.length} selected technical questions permanently?`)) return;

    try {
      const res = await authFetch('/api/questions/bulk-delete', {
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
      const url = editingId ? `/api/questions/${editingId}` : '/api/questions';

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
      questionText: '',
      profileId: profiles[0]?._id || '',
      skillId: skills[0]?._id || '',
      difficulty: 'Medium',
      expectedAnswer: ''
    });
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setFormData({
      questionText: q.questionText,
      profileId: q.profileId?._id || q.profileId,
      skillId: q.skillId?._id || q.skillId,
      difficulty: q.difficulty || 'Medium',
      expectedAnswer: q.expectedAnswer || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete Question?')) return;
    try {
      const res = await authFetch(`/api/questions/${id}`, { method: 'DELETE' });
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
          checked={questions.length > 0 && selectedIds.length === questions.length}
          onChange={toggleSelectAll}
          className="rounded text-erp-primary"
        />
      ),
      accessor: '_id',
      width: '40px',
      render: q => (
        <input
          type="checkbox"
          checked={selectedIds.includes(q._id)}
          onChange={() => toggleSelectRow(q._id)}
          className="rounded text-erp-primary"
        />
      )
    },
    { header: 'Question Text', accessor: 'questionText', render: q => <span className="font-semibold text-gray-900">{q.questionText}</span> },
    { header: 'Applied Profile', accessor: 'profileId', render: q => q.profileId?.title || 'N/A' },
    { header: 'Target Skill', accessor: 'skillId', render: q => <Badge variant="info">{q.skillId?.name || 'N/A'}</Badge> },
    { header: 'Difficulty', accessor: 'difficulty', render: q => (
      <Badge variant={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'}>
        {q.difficulty}
      </Badge>
    )},
    { header: 'Actions', accessor: '_id', render: q => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleEdit(q)} className="p-1 border text-erp-primary hover:bg-gray-100 rounded" title="Edit Question">
          <Edit size={13} />
        </button>
        <button onClick={() => handleDelete(q._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded" title="Delete Question">
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
            <HelpCircle size={18} /> Technical Question Bank & Bulk Controller
          </h2>
          <p className="text-xs text-gray-600">Select multiple questions to bulk update profiles, skills, difficulty, or delete.</p>
        </div>
        <button onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Technical Question
        </button>
      </div>

      {/* Bulk Actions Toolbar Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-yellow-900">
            <CheckSquare size={16} />
            <span>{selectedIds.length} Questions Selected for Bulk Edit</span>
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

            {/* Bulk Skill Update */}
            <div className="flex items-center gap-1">
              <select
                value={bulkSkillId}
                onChange={e => {
                  setBulkSkillId(e.target.value);
                  if (e.target.value) handleBulkUpdate({ skillId: e.target.value }, 'Target Skill');
                }}
                className="erp-select text-xs font-semibold bg-white"
              >
                <option value="">-- Bulk Change Skill --</option>
                {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
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

      {/* Questions Data Table */}
      <DataTable columns={columns} data={questions} searchPlaceholder="Search questions..." />

      {/* Add / Edit Question Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Technical Question" : "Create Technical Question"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Question Text *</label>
            <textarea required rows={3} value={formData.questionText} onChange={e => setFormData({ ...formData, questionText: e.target.value })} className="erp-input" />
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
              <label className="block font-semibold text-gray-700 mb-1">Target Skill *</label>
              <select required value={formData.skillId} onChange={e => setFormData({ ...formData, skillId: e.target.value })} className="erp-select">
                <option value="">-- Select Skill --</option>
                {skills.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Difficulty</label>
              <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="erp-select">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Expected Answer Key</label>
              <input type="text" value={formData.expectedAnswer} onChange={e => setFormData({ ...formData, expectedAnswer: e.target.value })} className="erp-input" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">{editingId ? "Save Question Changes" : "Add Question"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
