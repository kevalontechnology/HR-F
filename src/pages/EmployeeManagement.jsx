import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const EmployeeManagement = () => {
  const { authFetch } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    roleId: '',
    skills: [],
    experienceYears: 2,
    capacity: 10,
    availability: 'Available',
    status: 'Active',
    password: 'Kevalon@123'
  });

  const fetchData = async () => {
    try {
      const eRes = await authFetch('/api/employees');
      if (eRes.success) setEmployees(eRes.data || []);

      const rRes = await authFetch('/api/roles');
      if (rRes.success) setRoles(rRes.data || []);

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
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/employees/${editingId}` : '/api/employees';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.success) {
        setIsModalOpen(false);
        setEditingId(null);
        resetForm();
        fetchData();
        if (res.message) alert(res.message);
      } else {
        alert(res.message || 'Operation failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      mobile: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      roleId: roles[0]?._id || '',
      skills: [],
      experienceYears: 2,
      capacity: 10,
      availability: 'Available',
      status: 'Active',
      password: 'Kevalon@123'
    });
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      mobile: emp.mobile,
      department: emp.department,
      designation: emp.designation,
      roleId: emp.roleId?._id || emp.roleId,
      skills: (emp.skills || []).map(s => s._id || s),
      experienceYears: emp.experienceYears,
      capacity: emp.capacity,
      availability: emp.availability,
      status: emp.status,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee? Linked user login will be disabled.')) return;
    try {
      const res = await authFetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Emp Code', accessor: 'employeeCode', render: e => (
      <span className="font-bold text-erp-primary">{e.employeeCode}</span>
    )},
    { header: 'Full Name', accessor: 'fullName', render: e => (
      <div>
        <div className="font-semibold text-gray-900">{e.fullName}</div>
        <div className="text-[11px] text-gray-500">{e.email} | {e.mobile}</div>
      </div>
    )},
    { header: 'Department / Designation', accessor: 'department', render: e => (
      <div>
        <div className="font-semibold">{e.designation}</div>
        <div className="text-[11px] text-gray-500">{e.department}</div>
      </div>
    )},
    { header: 'Assigned Role', accessor: 'roleId', render: e => (
      <Badge variant="primary">{e.roleId?.name || 'N/A'}</Badge>
    )},
    { header: 'Queue / Capacity', accessor: 'capacity', render: e => (
      <span>{e.currentQueueCount || 0} / {e.capacity}</span>
    )},
    { header: 'Availability', accessor: 'availability', render: e => (
      <Badge variant={e.availability === 'Available' ? 'success' : 'warning'}>{e.availability}</Badge>
    )},
    { header: 'Actions', accessor: '_id', render: e => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleEdit(e)} className="p-1 border text-erp-primary hover:bg-gray-100 rounded">
          <Edit size={13} />
        </button>
        <button onClick={() => handleDelete(e._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded">
          <Trash2 size={13} />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Users size={18} /> Employee Master & Login User Directory
          </h2>
          <p className="text-xs text-gray-600">
            Employee code generation, role sync, skills tagger, capacity limits.
          </p>
        </div>

        <button 
          onClick={() => { setEditingId(null); resetForm(); setIsModalOpen(true); }}
          className="btn-erp-primary flex items-center gap-1.5"
        >
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <DataTable columns={columns} data={employees} searchPlaceholder="Search employees by name, code, email..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Employee" : "Create Employee & User Account"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mobile</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Assigned System Role</label>
              <select
                required
                value={formData.roleId}
                onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                className="erp-select font-bold"
              >
                <option value="">-- Select Role --</option>
                {roles.map(r => (
                  <option key={r._id} value={r._id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Max Daily Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Availability</label>
              <select
                value={formData.availability}
                onChange={e => setFormData({ ...formData, availability: e.target.value })}
                className="erp-select"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          {!editingId && (
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Initial Login Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="erp-input"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">{editingId ? "Save Changes" : "Create Employee"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
