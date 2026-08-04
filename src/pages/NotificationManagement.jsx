import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { BellRing, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const NotificationManagement = () => {
  const { authFetch } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    eventKey: '',
    eventName: '',
    titleTemplate: '',
    bodyTemplate: '',
    channels: ['In-App']
  });

  const fetchData = async () => {
    try {
      const res = await authFetch('/api/notifications/templates');
      if (res.success) setTemplates(res.data || []);
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
      const res = await authFetch('/api/notifications/templates', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ eventKey: '', eventName: '', titleTemplate: '', bodyTemplate: '', channels: ['In-App'] });
        fetchData();
      } else {
        alert(res.message || 'Failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete Template?')) return;
    try {
      const res = await authFetch(`/api/notifications/templates/${id}`, { method: 'DELETE' });
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Event Key', accessor: 'eventKey', render: t => <span className="font-mono text-xs font-bold text-erp-primary">{t.eventKey}</span> },
    { header: 'Event Name', accessor: 'eventName', render: t => t.eventName },
    { header: 'Title Template', accessor: 'titleTemplate', render: t => <span className="text-xs font-medium">{t.titleTemplate}</span> },
    { header: 'Channels', accessor: 'channels', render: t => (
      <div className="flex gap-1">
        {(t.channels || []).map((ch, i) => <Badge key={i} variant="info">{ch}</Badge>)}
      </div>
    )},
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
            <BellRing size={18} /> Notification Template Master
          </h2>
          <p className="text-xs text-gray-600">Configure trigger events and customizable message templates.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Template
        </button>
      </div>

      <DataTable columns={columns} data={templates} searchPlaceholder="Search templates..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Notification Template">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Trigger Key</label>
            <input type="text" required value={formData.eventKey} onChange={e => setFormData({ ...formData, eventKey: e.target.value.toUpperCase() })} placeholder="e.g. CANDIDATE_ASSIGNED" className="erp-input uppercase font-mono" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Name</label>
            <input type="text" required value={formData.eventName} onChange={e => setFormData({ ...formData, eventName: e.target.value })} className="erp-input" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Title Template</label>
            <input type="text" required value={formData.titleTemplate} onChange={e => setFormData({ ...formData, titleTemplate: e.target.value })} placeholder="Candidate {{candidateName}} Assigned" className="erp-input" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Body Message Template</label>
            <textarea required rows={3} value={formData.bodyTemplate} onChange={e => setFormData({ ...formData, bodyTemplate: e.target.value })} className="erp-input" />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Create Template</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
