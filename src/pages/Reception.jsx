import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Ticket, Search, Clock, CheckCircle2, Phone, User, GraduationCap, X, Sparkles, Users } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';
import { Preloader } from '../components/common/Preloader';

export const Reception = () => {
  const { authFetch } = useAuth();
  const [registeredCandidates, setRegisteredCandidates] = useState([]);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [selectedCandId, setSelectedCandId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchData = async () => {
    try {
      const cRes = await authFetch('/api/candidates');
      if (cRes.success) {
        setRegisteredCandidates((cRes.data || []).filter(c => c.stage === 'REGISTERED'));
      }

      const qRes = await authFetch('/api/reception/queue');
      if (qRes.success) {
        setWaitingQueue(qRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!selectedCandId) return;

    setLoading(true);
    setCheckInResult(null);
    try {
      const res = await authFetch('/api/reception/check-in', {
        method: 'POST',
        body: JSON.stringify({ candidateId: selectedCandId })
      });

      if (res.success) {
        setCheckInResult(res);
        setSelectedCandId('');
        setSearchQuery('');
        fetchData();
      } else {
        alert(res.message || 'Check-in failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCheckInTime = (timeVal) => {
    if (!timeVal) return 'N/A';
    try {
      return new Date(timeVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'N/A';
    }
  };

  // Filter registered candidates by Name, Mobile Number, Enrollment No, or Code
  const filteredCandidates = registeredCandidates.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.candidateCode && c.candidateCode.toLowerCase().includes(q)) ||
      (c.enrollmentNo && c.enrollmentNo.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const selectedCandidateObj = registeredCandidates.find(c => c._id === selectedCandId);

  if (initialLoading) {
    return <Preloader message="Loading Reception Check-In Desk & Live Queue..." />;
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <UserCheck size={18} /> Reception Check-In Desk & Live Queue
          </h2>
          <p className="text-xs text-gray-600">
            Search arriving candidates by Name or Mobile Number, issue token numbers, and auto-route to technical queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Users size={14} className="text-erp-primary" />
            <span>{registeredCandidates.length} Registered</span>
          </div>
          <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded text-xs font-bold text-green-900 flex items-center gap-1.5">
            <Clock size={14} className="text-green-700" />
            <span>{waitingQueue.length} In Waiting Queue</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check-In Desk Panel with Live Search Filter */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 sm:p-5 space-y-4">
          <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider border-b pb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Ticket size={16} /> Search Candidate & Issue Token</span>
            <Sparkles size={14} className="text-yellow-600 animate-pulse" />
          </h3>

          <form onSubmit={handleCheckIn} className="space-y-4">
            {/* Live Search Input Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>Search Candidate (Name / Mobile No.)</span>
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5"
                  >
                    <X size={12} /> Clear Filter
                  </button>
                )}
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type candidate name, mobile, or enrollment..."
                  className="erp-input pl-8 font-medium text-xs border-erp-primary/40 focus:border-erp-primary"
                />
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
              </div>
            </div>

            {/* Candidate Search Results Select List */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-1">
                <span>Matching Candidates ({filteredCandidates.length})</span>
                <span className="text-erp-primary">{registeredCandidates.length} Registered</span>
              </div>

              <div className="max-h-56 overflow-y-auto border border-erp-border rounded-xs divide-y divide-gray-100 bg-gray-50/50">
                {filteredCandidates.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No registered candidates matching "{searchQuery}".
                  </div>
                ) : (
                  filteredCandidates.map(c => {
                    const isSelected = selectedCandId === c._id;
                    return (
                      <div
                        key={c._id}
                        onClick={() => setSelectedCandId(c._id)}
                        className={`p-3 text-xs cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-erp-primary text-white font-semibold shadow-xs'
                            : 'hover:bg-blue-50 text-gray-800'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="font-bold flex items-center gap-1">
                            <User size={13} /> {c.fullName}
                          </div>
                          <div className={`text-[10px] flex items-center gap-2 ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                            <span className="flex items-center gap-0.5"><Phone size={10} /> {c.mobile}</span>
                            <span>| Code: {c.candidateCode}</span>
                          </div>
                          {c.enrollmentNo && (
                            <div className={`text-[10px] font-mono ${isSelected ? 'text-yellow-200' : 'text-indigo-700 font-semibold'}`}>
                              Enr: {c.enrollmentNo} ({c.collegeName || 'College'})
                            </div>
                          )}
                          <div className={`text-[10px] truncate max-w-[210px] ${isSelected ? 'text-yellow-300 font-bold' : 'text-erp-primary font-medium'}`}>
                            Profile: {c.appliedProfileId?.title || c.appliedProfileName || 'N/A'}
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 size={18} className="text-yellow-400 flex-shrink-0" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Candidate Active Card Banner */}
            {selectedCandidateObj && (
              <div className="p-3 bg-blue-50 border border-blue-300 rounded text-xs text-blue-950 space-y-1 animate-fadeIn">
                <div className="font-bold text-blue-900 flex items-center justify-between border-b border-blue-200 pb-1">
                  <span>Candidate Selected for Check-In:</span>
                  <span className="bg-erp-primary text-white px-2 py-0.5 rounded text-[10px]">Ready for Token</span>
                </div>
                <div className="font-bold text-sm text-erp-primary">{selectedCandidateObj.fullName}</div>
                <div className="text-[11px] font-mono text-gray-700">Mobile: {selectedCandidateObj.mobile} | Enr: {selectedCandidateObj.enrollmentNo || 'N/A'}</div>
                <div className="text-[11px] font-semibold text-blue-800">Applied Profile: {selectedCandidateObj.appliedProfileId?.title || selectedCandidateObj.appliedProfileName}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedCandId}
              className="w-full btn-erp-primary py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
              {loading ? 'Processing Token...' : 'Confirm Check-In & Issue Token'}
            </button>
          </form>

          {/* Token Receipt Alert */}
          {checkInResult && (
            <div className="p-4 bg-green-50 border border-green-300 text-green-900 rounded-xs space-y-1 text-xs animate-fadeIn">
              <div className="font-bold text-sm text-green-800 flex items-center gap-1">
                <Ticket size={16} /> Token Issued: {checkInResult.tokenNumber}
              </div>
              <p>Candidate: <strong>{checkInResult.candidate?.fullName}</strong></p>
              <p className="text-[11px] text-green-700 font-medium">
                {checkInResult.autoAssignment?.success
                  ? `Auto-assigned to: ${checkInResult.autoAssignment.assignedInterviewer?.fullName}`
                  : checkInResult.autoAssignment?.message}
              </p>
            </div>
          )}
        </div>

        {/* Live Reception & Waiting Queue */}
        <div className="md:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs overflow-hidden">
          <div className="bg-erp-primary text-white px-4 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Clock size={15} /> Live Reception Waiting Queue Stream</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">{waitingQueue.length} Candidates In Queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Candidate Name</th>
                  <th>Mobile No.</th>
                  <th>Applied Profile</th>
                  <th>Check-In Time</th>
                  <th>Current Queue Stage</th>
                </tr>
              </thead>
              <tbody>
                {waitingQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No candidates currently in waiting queue.
                    </td>
                  </tr>
                ) : (
                  waitingQueue.map((c) => (
                    <tr key={c._id}>
                      <td className="font-bold text-erp-primary">{c.tokenNumber}</td>
                      <td className="font-semibold">{c.fullName}</td>
                      <td className="text-xs font-mono">{c.mobile}</td>
                      <td>{c.appliedProfileId?.title || c.appliedProfileName || 'N/A'}</td>
                      <td className="text-xs text-gray-600 font-mono font-semibold">
                        {formatCheckInTime(c.checkInTime || c.updatedAt)}
                      </td>
                      <td><StageBadge stage={c.stage} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
