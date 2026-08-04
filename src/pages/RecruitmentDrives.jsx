import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const RecruitmentDrives = () => {
  const { authFetch } = useAuth();
  const [drives, setDrives] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ driveName: '', campusLocation: '', driveDate: '', status: 'Active', description: '' });

  const fetchData = async () => {
    try {
      const res = await authFetch('/api/drives');
      if (res.success) setDrives(res.data || []);
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
      const res = await authFetch('/api/drives', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ driveName: '', campusLocation: '', driveDate: '', status: 'Active', description: '' });
        fetchData();
      } else {
        alert(res.message || 'Failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete Drive?')) return;
    try {
      const res = await authFetch(`/api/drives/${id}`, { method: 'DELETE' });
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Drive Name', accessor: 'driveName', render: d => (
      <div>
        <div className="font-bold text-erp-primary">{d.driveName}</div>
        <div className="text-[10px] text-gray-500">{d.driveCode}</div>
      </div>
    )},
    { header: 'Campus / Location', accessor: 'campusLocation', render: d => d.campusLocation },
    { header: 'Drive Date', accessor: 'driveDate', render: d => new Date(d.driveDate).toLocaleDateString() },
    { header: 'Status', accessor: 'status', render: d => <Badge variant={d.status === 'Active' ? 'success' : 'default'}>{d.status}</Badge> },
    { header: 'Actions', accessor: '_id', render: d => (
      <button onClick={() => handleDelete(d._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded">
        <Trash2 size={13} />
      </button>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Calendar size={18} /> Recruitment Drives Master
          </h2>
          <p className="text-xs text-gray-600">Schedule and manage campus & off-campus recruitment drives.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-erp-primary flex items-center gap-1">
          <Plus size={14} /> Schedule Drive
        </button>
      </div>

      <DataTable columns={columns} data={drives} searchPlaceholder="Search drives..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Recruitment Drive">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Drive Name</label>
            <input type="text" required value={formData.driveName} onChange={e => setFormData({ ...formData, driveName: e.target.value })} placeholder="e.g. Kevalon Campus Drive 2026" className="erp-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Campus Location</label>
              <input type="text" required value={formData.campusLocation} onChange={e => setFormData({ ...formData, campusLocation: e.target.value })} className="erp-input" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Drive Date</label>
              <input type="date" required value={formData.driveDate} onChange={e => setFormData({ ...formData, driveDate: e.target.value })} className="erp-input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Schedule Drive</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
