import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Briefcase, Plus, Users, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const PanelManagement = () => {
  const { authFetch } = useAuth();
  const [panels, setPanels] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);

  const [formData, setFormData] = useState({
    panelName: '',
    panelType: 'Technical',
    members: [],
    targetSkills: [],
    maxCapacityPerInterviewer: 10,
    status: 'Active'
  });

  const [overrideData, setOverrideData] = useState({
    candidateId: '',
    stageType: 'Technical',
    interviewerId: ''
  });

  const fetchData = async () => {
    try {
      const pRes = await authFetch('/api/panels');
      if (pRes.success) setPanels(pRes.data || []);

      const eRes = await authFetch('/api/employees');
      if (eRes.success) setEmployees(eRes.data || []);

      const sRes = await authFetch('/api/skills');
      if (sRes.success) setSkills(sRes.data || []);

      const cRes = await authFetch('/api/candidates');
      if (cRes.success) setCandidates(cRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/panels', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ panelName: '', panelType: 'Technical', members: [], targetSkills: [], maxCapacityPerInterviewer: 10, status: 'Active' });
        fetchData();
      } else {
        alert(res.message || 'Error creating panel');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/candidates/manual-assign', {
        method: 'POST',
        body: JSON.stringify(overrideData)
      });
      if (res.success) {
        alert(res.message);
        setIsOverrideOpen(false);
        fetchData();
      } else {
        alert(res.message || 'Override failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Panel Name', accessor: 'panelName', render: p => (
      <div>
        <div className="font-bold text-erp-primary">{p.panelName}</div>
        <div className="text-[10px] text-gray-500">Cap: {p.maxCapacityPerInterviewer} per interviewer</div>
      </div>
    )},
    { header: 'Type', accessor: 'panelType', render: p => (
      <Badge variant={p.panelType === 'Technical' ? 'primary' : p.panelType === 'Practical' ? 'warning' : 'success'}>
        {p.panelType}
      </Badge>
    )},
    { header: 'Assigned Members', accessor: 'members', render: p => (
      <div className="text-xs space-y-0.5">
        {(p.members || []).map(m => (
          <div key={m._id} className="font-semibold text-gray-800">
            • {m.fullName} ({m.currentQueueCount || 0}/{m.capacity || 10} in queue)
          </div>
        ))}
      </div>
    )},
    { header: 'Status', accessor: 'status', render: p => (
      <Badge variant={p.status === 'Active' ? 'success' : 'danger'}>{p.status}</Badge>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Briefcase size={18} /> Panel Management & Smart Auto-Assignment Controller
          </h2>
          <p className="text-xs text-gray-600">
            Configure Technical, Practical, & HR Interview panels, assign interviewer capacities, manual override routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOverrideOpen(true)}
            className="btn-erp-secondary flex items-center gap-1.5"
          >
            <ArrowRightLeft size={14} /> Manual Override Candidate
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-erp-primary flex items-center gap-1.5"
          >
            <Plus size={14} /> Create Interview Panel
          </button>
        </div>
      </div>

      {/* Panels Table */}
      <DataTable columns={columns} data={panels} searchPlaceholder="Search panels..." />

      {/* Create Panel Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Interview Panel">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Panel Name</label>
            <input
              type="text"
              required
              value={formData.panelName}
              onChange={e => setFormData({ ...formData, panelName: e.target.value })}
              placeholder="e.g. MERN Technical Core Panel"
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Panel Type</label>
              <select
                value={formData.panelType}
                onChange={e => setFormData({ ...formData, panelType: e.target.value })}
                className="erp-select font-bold"
              >
                <option value="Technical">Technical Panel</option>
                <option value="Practical">Practical Panel</option>
                <option value="HR">HR Evaluation Panel</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Max Capacity / Interviewer</label>
              <input
                type="number"
                value={formData.maxCapacityPerInterviewer}
                onChange={e => setFormData({ ...formData, maxCapacityPerInterviewer: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Assign Panel Members (Employees)</label>
            <select
              multiple
              className="erp-select h-28"
              value={formData.members}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, members: options });
              }}
            >
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.designation}) - Queue: {emp.currentQueueCount || 0}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple interviewers.</p>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Create Panel</button>
          </div>
        </form>
      </Modal>

      {/* Manual Override Candidate Modal */}
      <Modal isOpen={isOverrideOpen} onClose={() => setIsOverrideOpen(false)} title="Manual Override Candidate Assignment">
        <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Select Candidate</label>
            <select
              required
              value={overrideData.candidateId}
              onChange={e => setOverrideData({ ...overrideData, candidateId: e.target.value })}
              className="erp-select"
            >
              <option value="">-- Select Candidate --</option>
              {candidates.map(c => (
                <option key={c._id} value={c._id}>{c.fullName} ({c.candidateCode}) - Stage: {c.stage}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Stage Panel Type</label>
              <select
                value={overrideData.stageType}
                onChange={e => setOverrideData({ ...overrideData, stageType: e.target.value })}
                className="erp-select font-bold"
              >
                <option value="Technical">Technical</option>
                <option value="Practical">Practical</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Target Interviewer (Employee)</label>
              <select
                required
                value={overrideData.interviewerId}
                onChange={e => setOverrideData({ ...overrideData, interviewerId: e.target.value })}
                className="erp-select"
              >
                <option value="">-- Select Interviewer --</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.designation})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <button type="button" onClick={() => setIsOverrideOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Force Manual Assignment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
