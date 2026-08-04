import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { StageBadge } from '../components/common/Badge';
import { UserPlus, Upload, Eye, Trash2, Download, CheckCircle, Edit } from 'lucide-react';

export const CandidateManagement = () => {
  const { authFetch } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [drives, setDrives] = useState([]);

  const [activeStageFilter, setActiveStageFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [detailCandidate, setDetailCandidate] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    appliedProfileId: '',
    skills: [],
    experienceYears: 0,
    driveId: ''
  });

  const [importJson, setImportJson] = useState(`[
  {
    "fullName": "Rahul Verma",
    "email": "rahul.verma@example.com",
    "mobile": "9876543210",
    "experienceYears": 2
  },
  {
    "fullName": "Ananya Roy",
    "email": "ananya.roy@example.com",
    "mobile": "9876543211",
    "experienceYears": 3
  }
]`);

  const fetchCandidates = async () => {
    try {
      const res = await authFetch('/api/candidates');
      if (res.success) setCandidates(res.data || []);

      const pRes = await authFetch('/api/profiles');
      if (pRes.success) setProfiles(pRes.data || []);

      const sRes = await authFetch('/api/skills');
      if (sRes.success) setSkillsList(sRes.data || []);

      const dRes = await authFetch('/api/drives');
      if (dRes.success) setDrives(dRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/candidates', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ fullName: '', email: '', mobile: '', appliedProfileId: '', skills: [], experienceYears: 0, driveId: '' });
        fetchCandidates();
      } else {
        alert(res.message || 'Error creating candidate');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('Invalid JSON array format.');
        return;
      }

      // Tag with default profile if missing
      const defaultProf = profiles[0]?._id;
      const list = parsed.map(c => ({
        ...c,
        appliedProfileId: c.appliedProfileId || defaultProf
      }));

      const res = await authFetch('/api/candidates/import', {
        method: 'POST',
        body: JSON.stringify({ candidatesList: list })
      });

      if (res.success) {
        alert(res.message);
        setIsImportOpen(false);
        fetchCandidates();
      } else {
        alert(res.message || 'Import failed');
      }
    } catch (err) {
      alert('JSON Parse Error: ' + err.message);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (activeStageFilter === 'ALL') return true;
    if (activeStageFilter === 'WAITING') return c.stage.includes('QUEUE') || c.stage === 'RECEPTION_WAITING';
    if (activeStageFilter === 'TECHNICAL') return c.stage.includes('TECHNICAL');
    if (activeStageFilter === 'PRACTICAL') return c.stage.includes('PRACTICAL');
    if (activeStageFilter === 'HR') return c.stage.includes('HR');
    return c.finalResult === activeStageFilter || c.stage === activeStageFilter;
  });

  const columns = [
    { header: 'Code / Token', accessor: 'candidateCode', render: c => (
      <div>
        <div className="font-bold text-erp-primary">{c.candidateCode}</div>
        {c.tokenNumber && <div className="text-[10px] text-green-700 font-bold">Token: {c.tokenNumber}</div>}
      </div>
    )},
    { header: 'Candidate Name', accessor: 'fullName', render: c => (
      <div>
        <div className="font-semibold text-gray-900">{c.fullName}</div>
        <div className="text-[11px] text-gray-500">{c.email} | {c.mobile}</div>
      </div>
    )},
    { header: 'Applied Profile', accessor: 'appliedProfileId', render: c => c.appliedProfileId?.title || 'N/A' },
    { header: 'Experience', accessor: 'experienceYears', render: c => `${c.experienceYears} Years` },
    { header: 'Stage', accessor: 'stage', render: c => <StageBadge stage={c.stage} /> },
    { header: 'Assigned Interviewer', accessor: 'assignedTechnicalInterviewer', render: c => (
      <span className="text-xs">
        {c.assignedTechnicalInterviewer?.fullName || c.assignedPracticalInterviewer?.fullName || c.assignedHrInterviewer?.fullName || 'None'}
      </span>
    )},
    { header: 'Actions', accessor: '_id', render: c => (
      <button 
        onClick={() => setDetailCandidate(c)}
        className="p-1 border border-erp-border hover:bg-gray-100 rounded text-erp-primary text-xs flex items-center gap-1"
      >
        <Eye size={13} /> View
      </button>
    )}
  ];

  return (
    <div className="space-y-4">
      {/* Title & Actions Bar */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide">
            Candidate Master Directory
          </h2>
          <p className="text-xs text-gray-600">
            Manage candidates, import excel lists, track interview history & dynamic status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="btn-erp-secondary flex items-center gap-1.5"
          >
            <Upload size={14} /> Import Excel / CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-erp-primary flex items-center gap-1.5"
          >
            <UserPlus size={14} /> Add Candidate
          </button>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex flex-wrap gap-1 bg-white p-2 border border-erp-border rounded-xs">
        {[
          { id: 'ALL', label: 'All Candidates' },
          { id: 'REGISTERED', label: 'Registered' },
          { id: 'WAITING', label: 'In Queue' },
          { id: 'TECHNICAL', label: 'Technical Stage' },
          { id: 'PRACTICAL', label: 'Practical Stage' },
          { id: 'HR', label: 'HR Stage' },
          { id: 'SELECTED', label: 'Selected' },
          { id: 'HOLD', label: 'Hold' },
          { id: 'REJECTED', label: 'Rejected' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStageFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition ${
              activeStageFilter === tab.id
                ? 'bg-erp-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Candidate Data Grid */}
      <DataTable
        columns={columns}
        data={filteredCandidates}
        searchPlaceholder="Search candidates by name, code, email..."
      />

      {/* Create Candidate Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Candidate">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Applied Profile</label>
              <select
                required
                value={formData.appliedProfileId}
                onChange={e => setFormData({ ...formData, appliedProfileId: e.target.value })}
                className="erp-select"
              >
                <option value="">-- Select Applied Profile --</option>
                {profiles.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Recruitment Drive</label>
              <select
                value={formData.driveId}
                onChange={e => setFormData({ ...formData, driveId: e.target.value })}
                className="erp-select"
              >
                <option value="">-- Direct Walk-In / General --</option>
                {drives.map(d => (
                  <option key={d._id} value={d._id}>{d.driveName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Register Candidate</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Excel / CSV Import Modal */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Excel / CSV Candidates Bulk Import">
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <p className="text-xs text-gray-600">
            Paste JSON or parsed CSV candidate data array to import candidates in bulk.
          </p>
          <textarea
            rows={8}
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            className="erp-input font-mono text-xs"
          />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setIsImportOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary flex items-center gap-1">
              <Upload size={14} /> Process Bulk Import
            </button>
          </div>
        </form>
      </Modal>

      {/* Candidate Detail View Modal */}
      <Modal isOpen={!!detailCandidate} onClose={() => setDetailCandidate(null)} title="Candidate Comprehensive History">
        {detailCandidate && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border">
              <div>
                <p><strong>Candidate Code:</strong> {detailCandidate.candidateCode}</p>
                <p><strong>Full Name:</strong> {detailCandidate.fullName}</p>
                <p><strong>Email:</strong> {detailCandidate.email}</p>
                <p><strong>Mobile:</strong> {detailCandidate.mobile}</p>
              </div>
              <div>
                <p><strong>Token Number:</strong> {detailCandidate.tokenNumber || 'N/A'}</p>
                <p><strong>Applied Profile:</strong> {detailCandidate.appliedProfileId?.title || 'N/A'}</p>
                <p><strong>Experience:</strong> {detailCandidate.experienceYears} Years</p>
                <p className="mt-1"><strong>Current Stage:</strong> <StageBadge stage={detailCandidate.stage} /></p>
              </div>
            </div>

            {/* Technical Result */}
            <div className="border p-3 rounded bg-white space-y-1">
              <h4 className="font-bold text-erp-primary uppercase border-b pb-1">Technical Evaluation</h4>
              <p>Score: <strong>{detailCandidate.technicalEvaluation?.score || 0}%</strong> | Verdict: <strong>{detailCandidate.technicalEvaluation?.verdict || 'PENDING'}</strong></p>
              <p>Remarks: {detailCandidate.technicalEvaluation?.remarks || 'N/A'}</p>
            </div>

            {/* Practical Result */}
            <div className="border p-3 rounded bg-white space-y-1">
              <h4 className="font-bold text-erp-primary uppercase border-b pb-1">Practical Task Evaluation</h4>
              <p>Score: <strong>{detailCandidate.practicalEvaluation?.score || 0}%</strong> | Verdict: <strong>{detailCandidate.practicalEvaluation?.verdict || 'PENDING'}</strong></p>
              <p>Remarks: {detailCandidate.practicalEvaluation?.remarks || 'N/A'}</p>
            </div>

            {/* HR Result */}
            <div className="border p-3 rounded bg-white space-y-1">
              <h4 className="font-bold text-erp-primary uppercase border-b pb-1">HR Evaluation</h4>
              <p>Communication: <strong>{detailCandidate.hrEvaluation?.communicationScore || 0}/5</strong> | Behavior: <strong>{detailCandidate.hrEvaluation?.behaviorScore || 0}/5</strong> | Confidence: <strong>{detailCandidate.hrEvaluation?.confidenceScore || 0}/5</strong></p>
              <p>Final Decision: <strong>{detailCandidate.hrEvaluation?.verdict || 'PENDING'}</strong></p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setDetailCandidate(null)} className="btn-erp-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
