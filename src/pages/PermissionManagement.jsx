import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Lock, Plus } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const PermissionManagement = () => {
  const { authFetch } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ module: '', name: '', code: '', description: '' });

  const fetchData = async () => {
    try {
      const res = await authFetch('/api/permissions');
      if (res.success) setPermissions(res.data || []);
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
      const res = await authFetch('/api/permissions', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ module: '', name: '', code: '', description: '' });
        fetchData();
      } else {
        alert(res.message || 'Failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Module', accessor: 'module', render: p => <Badge variant="primary">{p.module}</Badge> },
    { header: 'Permission Name', accessor: 'name', render: p => <span className="font-semibold">{p.name}</span> },
    { header: 'Permission Code', accessor: 'code', render: p => <span className="font-mono text-xs text-gray-600">{p.code}</span> }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Lock size={18} /> Permission Master Directory
          </h2>
          <p className="text-xs text-gray-600">Dynamic action permission keys mapped across modules.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Add Permission
        </button>
      </div>

      <DataTable columns={columns} data={permissions} searchPlaceholder="Search permissions..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Permission">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Module Key</label>
            <input type="text" required value={formData.module} onChange={e => setFormData({ ...formData, module: e.target.value })} placeholder="e.g. candidates" className="erp-input" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Permission Display Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Delete Candidates" className="erp-input" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Unique Code</label>
            <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. candidates_delete" className="erp-input font-mono" />
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Create Permission</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
