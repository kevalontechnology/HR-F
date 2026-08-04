import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { StageBadge } from '../components/common/Badge';
import { UserPlus, Upload, Eye, Trash2, Download, ExternalLink, GraduationCap } from 'lucide-react';

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
    enrollmentNo: '',
    collegeName: '',
    branch: 'Computer Engineering',
    semester: '8',
    tenthPercentage: '',
    twelfthPercentage: '',
    diplomaPercentage: '',
    currentCpiSpi: '',
    appliedProfileId: '',
    skills: [],
    experienceYears: 0,
    driveId: '',
    resumeUrl: ''
  });

  const sampleExcelJson = `[
  {
    "fullName": "Vansh P Patel",
    "email": "vanshpatel1496@gmail.com",
    "enrollmentNo": "2401031800033",
    "contactNo": "8200925369",
    "appliedProfile": {
      "$oid": "6a724609c1a2418815e96130"
    },
    "collegeName": "SOCET",
    "branch": "B.Tech - CSE",
    "semester": 5,
    "tenthPercentage": "73",
    "twelfthPercentage": "74",
    "diplomaPercentage": "NA",
    "currentCpiSpi": "8.75 CPI",
    "resume": "https://drive.google.com/open?id=1YW3IXr7OOtEbhfSeZ9HYOYvlGp3NVMr9"
  }
]`;

  const [importJson, setImportJson] = useState(sampleExcelJson);

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
        resetForm();
        fetchCandidates();
      } else {
        alert(res.message || 'Error registering candidate');
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
      enrollmentNo: '',
      collegeName: '',
      branch: 'Computer Engineering',
      semester: '8',
      tenthPercentage: '',
      twelfthPercentage: '',
      diplomaPercentage: '',
      currentCpiSpi: '',
      appliedProfileId: '',
      skills: [],
      experienceYears: 0,
      driveId: '',
      resumeUrl: ''
    });
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        alert('Invalid JSON candidate array format.');
        return;
      }

      const res = await authFetch('/api/candidates/import', {
        method: 'POST',
        body: JSON.stringify({ candidatesList: parsed })
      });

      if (res.success) {
        alert(res.message);
        setIsImportOpen(false);
        fetchCandidates();
      } else {
        alert(res.message || 'Import failed');
      }
    } catch (err) {
      alert('JSON Format Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      const res = await authFetch(`/api/candidates/${id}`, { method: 'DELETE' });
      if (res.success) fetchCandidates();
    } catch (err) {
      alert(err.message);
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
    { header: 'Candidate Details', accessor: 'fullName', render: c => (
      <div>
        <div className="font-semibold text-gray-900">{c.fullName}</div>
        <div className="text-[11px] text-gray-500">{c.email} | {c.mobile}</div>
        {c.enrollmentNo && <div className="text-[10px] text-indigo-700 font-mono">Enr: {c.enrollmentNo}</div>}
      </div>
    )},
    { header: 'College & Branch', accessor: 'collegeName', render: c => (
      <div>
        <div className="font-semibold text-gray-800">{c.collegeName || 'N/A'}</div>
        <div className="text-[11px] text-gray-500">{c.branch} {c.semester ? `(Sem ${c.semester})` : ''}</div>
      </div>
    )},
    { header: 'Applied Profile', accessor: 'appliedProfileId', render: c => c.appliedProfileId?.title || c.appliedProfileName || 'N/A' },
    { header: 'CPI / SPI', accessor: 'currentCpiSpi', render: c => (
      <span className="font-bold text-emerald-800">{c.currentCpiSpi || 'N/A'}</span>
    )},
    { header: 'Stage', accessor: 'stage', render: c => <StageBadge stage={c.stage} /> },
    { header: 'Actions', accessor: '_id', render: c => (
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setDetailCandidate(c)}
          className="p-1 border border-erp-border hover:bg-gray-100 rounded text-erp-primary text-xs flex items-center gap-1"
          title="View Full Profile"
        >
          <Eye size={13} /> View
        </button>
        <button 
          onClick={() => handleDelete(c._id)}
          className="p-1 border border-red-200 hover:bg-red-50 rounded text-red-600 text-xs"
          title="Delete Candidate"
        >
          <Trash2 size={13} />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-4">
      {/* Title & Actions Bar */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <GraduationCap size={20} /> Candidate Master Directory & Excel Import
          </h2>
          <p className="text-xs text-gray-600">
            Campus candidate records, enrollment numbers, college academic scores, and Excel bulk parser.
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
            onClick={() => { resetForm(); setIsModalOpen(true); }}
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
        searchPlaceholder="Search by name, code, enrollment, college, email..."
      />

      {/* Create Candidate Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Candidate (Campus / Walk-In)" maxWidth="max-w-3xl">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contact No. *</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Enrollment No.</label>
              <input
                type="text"
                value={formData.enrollmentNo}
                onChange={e => setFormData({ ...formData, enrollmentNo: e.target.value })}
                placeholder="e.g. ENR-2026-101"
                className="erp-input font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">College Name</label>
              <input
                type="text"
                value={formData.collegeName}
                onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                placeholder="e.g. L.D. College of Engineering"
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Profile Applied for *</label>
              <select
                required
                value={formData.appliedProfileId}
                onChange={e => setFormData({ ...formData, appliedProfileId: e.target.value })}
                className="erp-select"
              >
                <option value="">-- Select Profile --</option>
                {profiles.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Semester</label>
              <input
                type="text"
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Percentage in 10th</label>
              <input
                type="text"
                value={formData.tenthPercentage}
                onChange={e => setFormData({ ...formData, tenthPercentage: e.target.value })}
                placeholder="e.g. 85.5%"
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Percentage in 12th</label>
              <input
                type="text"
                value={formData.twelfthPercentage}
                onChange={e => setFormData({ ...formData, twelfthPercentage: e.target.value })}
                placeholder="e.g. 82.0%"
                className="erp-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Percentage in Diploma</label>
              <input
                type="text"
                value={formData.diplomaPercentage}
                onChange={e => setFormData({ ...formData, diplomaPercentage: e.target.value })}
                placeholder="e.g. N/A or 88%"
                className="erp-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Current CPI/SPI</label>
              <input
                type="text"
                value={formData.currentCpiSpi}
                onChange={e => setFormData({ ...formData, currentCpiSpi: e.target.value })}
                placeholder="e.g. 8.75"
                className="erp-input font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Submit Resume URL</label>
              <input
                type="text"
                value={formData.resumeUrl}
                onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="erp-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary">Register Candidate</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Excel / CSV Import Modal */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Excel / CSV Candidates Bulk Import Parser" maxWidth="max-w-3xl">
        <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1"><Upload size={14} /> Excel Header Field Mapping:</span>
            <p className="text-[11px]">
              The bulk parser automatically accepts JSON / CSV rows matching your exact Excel headers:
            </p>
            <code className="block bg-white p-2 rounded text-[10px] font-mono border">
              Email Address | Full Name | Enrollment No. | Contact No. | Profile Applied for | College Name | Branch | Semester | Percentage in 10th | Percentage in 12th | Percentage in Diploma | Current CPI/SPI | Submit Resume
            </code>
          </div>

          <textarea
            rows={10}
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            className="erp-input font-mono text-xs"
          />

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsImportOpen(false)} className="btn-erp-secondary">Cancel</button>
            <button type="submit" className="btn-erp-primary flex items-center gap-1">
              <Upload size={14} /> Process Campus Excel Import
            </button>
          </div>
        </form>
      </Modal>

      {/* Candidate Detailed History View Modal */}
      <Modal isOpen={!!detailCandidate} onClose={() => setDetailCandidate(null)} title={`Candidate Dossier: ${detailCandidate?.fullName}`} maxWidth="max-w-3xl">
        {detailCandidate && (
          <div className="space-y-4 text-xs">
            {/* Campus & Contact Card */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-erp-border">
              <div className="space-y-1">
                <p><strong>Candidate Code:</strong> <span className="font-mono text-erp-primary font-bold">{detailCandidate.candidateCode}</span></p>
                <p><strong>Full Name:</strong> {detailCandidate.fullName}</p>
                <p><strong>Email Address:</strong> {detailCandidate.email}</p>
                <p><strong>Contact No.:</strong> {detailCandidate.mobile}</p>
                <p><strong>Token Number:</strong> <span className="text-green-700 font-bold">{detailCandidate.tokenNumber || 'N/A (Not Checked In)'}</span></p>
                {detailCandidate.resumeUrl && (
                  <p className="pt-1">
                    <a href={detailCandidate.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold flex items-center gap-1">
                      <ExternalLink size={12} /> View Submitted Resume Link
                    </a>
                  </p>
                )}
              </div>

              <div className="space-y-1 border-l pl-4 border-gray-300">
                <p><strong>Enrollment No.:</strong> <span className="font-mono">{detailCandidate.enrollmentNo || 'N/A'}</span></p>
                <p><strong>College Name:</strong> {detailCandidate.collegeName || 'N/A'}</p>
                <p><strong>Branch / Semester:</strong> {detailCandidate.branch || 'N/A'} {detailCandidate.semester ? `(Sem ${detailCandidate.semester})` : ''}</p>
                <p><strong>Profile Applied for:</strong> {detailCandidate.appliedProfileId?.title || detailCandidate.appliedProfileName || 'N/A'}</p>
                <p><strong>Current Stage:</strong> <StageBadge stage={detailCandidate.stage} /></p>
              </div>
            </div>

            {/* Academic Performance Breakdown */}
            <div className="border p-3 rounded bg-white space-y-2">
              <h4 className="font-bold text-erp-primary uppercase border-b pb-1">Academic Performance Profile</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-gray-100 rounded">
                  <span className="text-[10px] text-gray-600 block">10th Score</span>
                  <strong className="text-gray-900">{detailCandidate.tenthPercentage || 'N/A'}</strong>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <span className="text-[10px] text-gray-600 block">12th Score</span>
                  <strong className="text-gray-900">{detailCandidate.twelfthPercentage || 'N/A'}</strong>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <span className="text-[10px] text-gray-600 block">Diploma Score</span>
                  <strong className="text-gray-900">{detailCandidate.diplomaPercentage || 'N/A'}</strong>
                </div>
                <div className="p-2 bg-emerald-100 rounded text-emerald-900">
                  <span className="text-[10px] text-emerald-700 block font-semibold">CPI / SPI</span>
                  <strong className="text-sm font-bold">{detailCandidate.currentCpiSpi || 'N/A'}</strong>
                </div>
              </div>
            </div>

            {/* Evaluation Results */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border p-3 rounded bg-blue-50/50 space-y-1">
                <h5 className="font-bold text-blue-900 uppercase">Technical</h5>
                <p>Score: <strong>{detailCandidate.technicalEvaluation?.score || 0}%</strong></p>
                <p>Verdict: <strong>{detailCandidate.technicalEvaluation?.verdict || 'PENDING'}</strong></p>
              </div>

              <div className="border p-3 rounded bg-purple-50/50 space-y-1">
                <h5 className="font-bold text-purple-900 uppercase">Practical</h5>
                <p>Score: <strong>{detailCandidate.practicalEvaluation?.score || 0}%</strong></p>
                <p>Verdict: <strong>{detailCandidate.practicalEvaluation?.verdict || 'PENDING'}</strong></p>
              </div>

              <div className="border p-3 rounded bg-teal-50/50 space-y-1">
                <h5 className="font-bold text-teal-900 uppercase">HR Final</h5>
                <p>Verdict: <strong>{detailCandidate.hrEvaluation?.verdict || 'PENDING'}</strong></p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setDetailCandidate(null)} className="btn-erp-secondary">Close Dossier</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
