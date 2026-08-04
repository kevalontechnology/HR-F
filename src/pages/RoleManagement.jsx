import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Shield, Plus, Lock, CheckSquare, Square, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const RoleManagement = () => {
  const { authFetch } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [allPermissions, setAllPermissions] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: []
  });

  const fetchData = async () => {
    try {
      const rRes = await authFetch('/api/roles');
      if (rRes.success) setRoles(rRes.data || []);

      const pRes = await authFetch('/api/permissions');
      if (pRes.success) {
        setAllPermissions(pRes.data || []);
        setPermissionsGrouped(pRes.grouped || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermission = (permId) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permId);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(id => id !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleSelectModuleAll = (modulePerms) => {
    const ids = modulePerms.map(p => p._id);
    const allSelected = ids.every(id => formData.permissions.includes(id));

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !ids.includes(id))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: Array.from(new Set([...prev.permissions, ...ids]))
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingRole ? 'PUT' : 'POST';
      const url = editingRole ? `/api/roles/${editingRole._id}` : '/api/roles';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.success) {
        setIsModalOpen(false);
        setEditingRole(null);
        setFormData({ name: '', code: '', description: '', permissions: [] });
        fetchData();
      } else {
        alert(res.message || 'Error saving role');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      permissions: (role.permissions || []).map(p => p._id || p)
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await authFetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Role Name', accessor: 'name', render: r => (
      <div>
        <div className="font-bold text-erp-primary">{r.name}</div>
        <div className="text-[10px] font-mono text-gray-500">{r.code}</div>
      </div>
    )},
    { header: 'Description', accessor: 'description', render: r => r.description || 'N/A' },
    { header: 'Granted Permissions', accessor: 'permissions', render: r => (
      <Badge variant="info">{(r.permissions || []).length} Module Permissions</Badge>
    )},
    { header: 'Type', accessor: 'isSystemRole', render: r => (
      <Badge variant={r.isSystemRole ? 'danger' : 'default'}>
        {r.isSystemRole ? 'System Built-In' : 'Custom Configured'}
      </Badge>
    )},
    { header: 'Actions', accessor: '_id', render: r => (
      <div className="flex items-center gap-1">
        <button onClick={() => handleEdit(r)} className="p-1 border text-erp-primary hover:bg-gray-100 rounded">
          <Edit size={13} /> Edit Matrix
        </button>
        {!r.isSystemRole && (
          <button onClick={() => handleDelete(r._id)} className="p-1 border text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Shield size={18} /> Role & Module Dynamic Permission Management (RBAC)
          </h2>
          <p className="text-xs text-gray-600">
            Define system roles and assign granular module permissions. No hardcoded access.
          </p>
        </div>

        <button 
          onClick={() => { setEditingRole(null); setFormData({ name: '', code: '', description: '', permissions: [] }); setIsModalOpen(true); }}
          className="btn-erp-primary flex items-center gap-1.5"
        >
          <Plus size={14} /> Create New Role
        </button>
      </div>

      <DataTable columns={columns} data={roles} searchPlaceholder="Search roles..." />

      {/* Role & Dynamic Permission Matrix Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? `Edit Role Matrix: ${editingRole.name}` : "Create Role & Assign Module Permissions"} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Technical Interviewer Lead"
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Unique Role Code</label>
              <input
                type="text"
                required
                disabled={!!editingRole?.isSystemRole}
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. ROLE_TECH_LEAD"
                className="erp-input uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Role Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="erp-input"
            />
          </div>

          {/* DYNAMIC PERMISSION CHECKBOX MATRIX */}
          <div className="border border-erp-border rounded p-3 bg-gray-50 space-y-4">
            <h4 className="font-bold text-erp-primary uppercase border-b pb-1 flex items-center gap-1">
              <Lock size={14} /> Module-Wise Dynamic Permission Matrix
            </h4>

            <div className="space-y-4 max-h-[350px] overflow-y-auto">
              {Object.keys(permissionsGrouped).map(modName => {
                const modulePerms = permissionsGrouped[modName] || [];
                const allSelected = modulePerms.every(p => formData.permissions.includes(p._id));

                return (
                  <div key={modName} className="bg-white border p-3 rounded space-y-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold uppercase text-erp-primary text-xs tracking-wider">
                        Module: {modName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectModuleAll(modulePerms)}
                        className="text-[11px] text-blue-700 hover:underline font-semibold"
                      >
                        {allSelected ? 'Deselect Module All' : 'Select Module All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {modulePerms.map(perm => {
                        const isChecked = formData.permissions.includes(perm._id);
                        return (
                          <label key={perm._id} className="inline-flex items-center gap-2 cursor-pointer p-1.5 border rounded hover:bg-gray-50 text-[11px]">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm._id)}
                              className="accent-erp-primary"
                            />
                            <span className="font-medium text-gray-800">{perm.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Save Role Permissions</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
