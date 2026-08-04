import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const TechnicalQuestionBank = () => {
  const { authFetch } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/questions', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ questionText: '', profileId: '', skillId: '', difficulty: 'Medium', expectedAnswer: '' });
        fetchData();
      } else {
        alert(res.message || 'Failed');
      }
    } catch (err) {
      alert(err.message);
    }
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
    { header: 'Question Text', accessor: 'questionText', render: q => <span className="font-semibold text-gray-900">{q.questionText}</span> },
    { header: 'Applied Profile', accessor: 'profileId', render: q => q.profileId?.title || 'N/A' },
    { header: 'Target Skill', accessor: 'skillId', render: q => <Badge variant="info">{q.skillId?.name || 'N/A'}</Badge> },
    { header: 'Difficulty', accessor: 'difficulty', render: q => (
      <Badge variant={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'}>
        {q.difficulty}
      </Badge>
    )},
    { header: 'Actions', accessor: '_id', render: q => (
      <button onClick={() => handleDelete(q._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded">
        <Trash2 size={13} />
      </button>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <HelpCircle size={18} /> Technical Question Bank Master
          </h2>
          <p className="text-xs text-gray-600">Question repository for automated Random 10 Technical Question drawer generation.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Technical Question
        </button>
      </div>

      <DataTable columns={columns} data={questions} searchPlaceholder="Search questions..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Technical Question">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Question Text</label>
            <textarea required rows={3} value={formData.questionText} onChange={e => setFormData({ ...formData, questionText: e.target.value })} className="erp-input" />
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
              <label className="block font-semibold text-gray-700 mb-1">Target Skill</label>
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
            <button type="submit" className="btn-erp-primary">Add Question</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
