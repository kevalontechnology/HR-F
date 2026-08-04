import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Users, Plus, Trash2, Edit, Key, Copy, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const EmployeeManagement = () => {
  const { authFetch } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Password Display Modal for Admin
  const [passwordModalData, setPasswordModalData] = useState(null);
  const [copied, setCopied] = useState(false);

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
    newPassword: ''
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

  const generateRandomPass = () => {
    const pass = `Kevalon@${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData(prev => ({ ...prev, newPassword: pass }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/employees/${editingId}` : '/api/employees';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify({
          ...formData,
          customPassword: formData.newPassword || undefined,
          password: formData.newPassword || undefined
        })
      });

      if (res.success) {
        setIsModalOpen(false);
        setEditingId(null);
        resetForm();
        fetchData();

        // Show Generated Password to Admin
        if (res.newPassword) {
          setPasswordModalData({
            employeeName: res.data?.fullName || formData.fullName,
            username: res.username || res.data?.email || formData.email,
            password: res.newPassword,
            message: res.message
          });
        } else {
          if (res.message) alert(res.message);
        }
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
      newPassword: ''
    });
  };

  const handleEdit = (emp) => {
    setEditingId(emp._id);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      mobile: emp.mobile,
      department: emp.department || 'Engineering',
      designation: emp.designation || 'Software Engineer',
      roleId: emp.roleId?._id || emp.roleId,
      skills: (emp.skills || []).map(s => s._id || s),
      experienceYears: emp.experienceYears || 2,
      capacity: emp.capacity || 10,
      availability: emp.availability || 'Available',
      status: emp.status || 'Active',
      newPassword: ''
    });
    setIsModalOpen(true);
  };

  const handleDirectPasswordReset = async (emp) => {
    if (!confirm(`Reset password for employee ${emp.fullName}? This will overwrite their old password.`)) return;

    try {
      const res = await authFetch(`/api/employees/${emp._id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({})
      });

      if (res.success) {
        setPasswordModalData({
          employeeName: emp.fullName,
          username: res.username || emp.email,
          password: res.newPassword,
          message: `Password reset successfully! Old password overwritten.`
        });
      } else {
        alert(res.message || 'Password reset failed.');
      }
    } catch (err) {
      alert(err.message);
    }
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    { header: 'Capacity', accessor: 'capacity', render: e => (
      <span>{e.currentQueueCount || 0} / {e.capacity}</span>
    )},
    { header: 'Availability', accessor: 'availability', render: e => (
      <Badge variant={e.availability === 'Available' ? 'success' : 'warning'}>{e.availability}</Badge>
    )},
    { header: 'Actions', accessor: '_id', render: e => (
      <div className="flex items-center gap-1">
        <button 
          onClick={() => handleDirectPasswordReset(e)} 
          className="p-1 border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded text-xs flex items-center gap-0.5"
          title="Generate / Overwrite Password"
        >
          <Key size={13} /> Reset Pass
        </button>
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
            Employee code generation, password reset engine, role sync, capacity limits.
          </p>
        </div>

        <button 
          onClick={() => { setEditingId(null); resetForm(); generateRandomPass(); setIsModalOpen(true); }}
          className="btn-erp-primary flex items-center gap-1.5"
        >
          <Plus size={14} /> Add Employee
        </button>
      </div>

      <DataTable columns={columns} data={employees} searchPlaceholder="Search employees by name, code, email..." />

      {/* Create / Edit Employee Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Employee Details" : "Create Employee & User Account"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Mobile *</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Assigned System Role *</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Password Override Field */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
            <label className="block font-bold text-erp-primary mb-1 flex items-center justify-between">
              <span>{editingId ? "Overwrite Password (Optional)" : "Default User Password"}</span>
              <button
                type="button"
                onClick={generateRandomPass}
                className="text-[11px] text-blue-700 font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw size={12} /> Auto-Generate
              </button>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder={editingId ? "Leave blank to keep current password" : "Enter or generate password..."}
                className="erp-input font-mono font-bold text-erp-primary"
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {editingId ? "Entering a new password here will overwrite the old password immediately." : "This plain text password will be displayed to you upon submission."}
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">{editingId ? "Save Changes" : "Create Employee Account"}</button>
          </div>
        </form>
      </Modal>

      {/* Admin Password View & Copy Modal */}
      <Modal isOpen={!!passwordModalData} onClose={() => setPasswordModalData(null)} title="Generated User Credentials (Admin View)">
        {passwordModalData && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-green-50 border border-green-300 rounded text-green-900 space-y-2">
              <div className="font-bold text-sm text-green-800 flex items-center gap-1.5">
                <CheckCircle2 size={18} /> {passwordModalData.message}
              </div>
              <p>Old password has been removed and replaced with the new generated password.</p>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 border rounded font-mono">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Employee Name</span>
                <strong className="text-gray-900 text-sm">{passwordModalData.employeeName}</strong>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Login Username / Email</span>
                <strong className="text-indigo-800 text-sm">{passwordModalData.username}</strong>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded">
                <span className="text-[10px] text-yellow-800 uppercase block font-bold">New Generated Password (Admin Only)</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-base font-bold text-yellow-900 tracking-wider font-mono">
                    {passwordModalData.password}
                  </span>
                  <button
                    onClick={() => copyToClipboard(passwordModalData.password)}
                    className="btn-erp-primary text-xs py-1 px-3 flex items-center gap-1"
                  >
                    {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy Password'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setPasswordModalData(null)} className="btn-erp-primary">
                Done & Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
