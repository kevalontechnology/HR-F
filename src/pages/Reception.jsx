import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Ticket, Search, Clock, CheckCircle2 } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';

export const Reception = () => {
  const { authFetch } = useAuth();
  const [registeredCandidates, setRegisteredCandidates] = useState([]);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [selectedCandId, setSelectedCandId] = useState('');
  const [checkInResult, setCheckInResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <UserCheck size={18} /> Candidate Reception Module & Check-In Desk
          </h2>
          <p className="text-xs text-gray-600">
            Issue token numbers for arriving candidates and route them automatically to technical queue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check-In Panel */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
            <Ticket size={16} /> Issue Candidate Token
          </h3>

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Arrived Candidate
              </label>
              <select
                required
                value={selectedCandId}
                onChange={e => setSelectedCandId(e.target.value)}
                className="erp-select"
              >
                <option value="">-- Choose Registered Candidate --</option>
                {registeredCandidates.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.fullName} ({c.candidateCode}) - {c.appliedProfileId?.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedCandId}
              className="w-full btn-erp-primary py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} />
              {loading ? 'Processing Token...' : 'Confirm Check-In & Issue Token'}
            </button>
          </form>

          {/* Token Receipt Alert */}
          {checkInResult && (
            <div className="p-4 bg-green-50 border border-green-300 text-green-900 rounded-xs space-y-1 text-xs">
              <div className="font-bold text-sm text-green-800 flex items-center gap-1">
                <Ticket size={16} /> Token Issued: {checkInResult.tokenNumber}
              </div>
              <p>Candidate: <strong>{checkInResult.candidate?.fullName}</strong></p>
              <p className="text-[11px] text-green-700">
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
            <span className="flex items-center gap-1.5"><Clock size={15} /> Live Reception Waiting Queue</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">{waitingQueue.length} Candidates In Queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Candidate Name</th>
                  <th>Applied Profile</th>
                  <th>Check-In Time</th>
                  <th>Current Queue Stage</th>
                </tr>
              </thead>
              <tbody>
                {waitingQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No candidates currently in waiting queue.
                    </td>
                  </tr>
                ) : (
                  waitingQueue.map((c) => (
                    <tr key={c._id}>
                      <td className="font-bold text-erp-primary">{c.tokenNumber}</td>
                      <td className="font-semibold">{c.fullName}</td>
                      <td>{c.appliedProfileId?.title || 'N/A'}</td>
                      <td className="text-xs text-gray-600">
                        {c.checkInTime ? new Date(c.checkInTime).toLocaleTimeString() : 'N/A'}
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
