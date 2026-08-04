import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Star, Send } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';

export const HREvaluationWorkstation = () => {
  const { user, authFetch } = useAuth();
  const [queueCandidates, setQueueCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const [commScore, setCommScore] = useState(4);
  const [behScore, setBehScore] = useState(4);
  const [confScore, setConfScore] = useState(4);
  const [verdict, setVerdict] = useState('SELECTED');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHrQueue = async () => {
    try {
      const res = await authFetch('/api/candidates');
      if (res.success) {
        const allHr = (res.data || []).filter(c => 
          c.stage === 'HR_QUEUE' || c.stage === 'HR_IN_PROGRESS' || c.stage === 'PRACTICAL_COMPLETED'
        );

        if (user?.employeeId && user?.role?.name !== 'Super Admin') {
          const empIdStr = user.employeeId._id ? user.employeeId._id.toString() : user.employeeId.toString();
          const myHr = allHr.filter(c => {
            const assignedId = c.assignedHrInterviewer?._id 
              ? c.assignedHrInterviewer._id.toString() 
              : c.assignedHrInterviewer?.toString();
            return assignedId === empIdStr || !assignedId;
          });
          setQueueCandidates(myHr);
        } else {
          setQueueCandidates(allHr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHrQueue();
    const interval = setInterval(fetchHrQueue, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setLoading(true);
    try {
      const payload = {
        communicationScore: commScore,
        behaviorScore: behScore,
        confidenceScore: confScore,
        verdict,
        remarks
      };

      const res = await authFetch(`/api/interviews/hr/${selectedCandidate._id}/evaluate`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        alert(res.message);
        setSelectedCandidate(null);
        fetchHrQueue();
      } else {
        alert(res.message || 'HR Evaluation failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <UserCheck size={18} /> HR Evaluation & Final Selection Panel
          </h2>
          <p className="text-xs text-gray-600">
            Rate communication, behavior, confidence, and issue final candidate verdict.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HR Queue */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider border-b pb-2 flex items-center justify-between">
            <span>HR Queue Candidates</span>
            <span className="bg-erp-primary text-white px-2 py-0.5 rounded text-[10px]">{queueCandidates.length}</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {queueCandidates.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No candidates in HR queue.</p>
            ) : (
              queueCandidates.map(c => (
                <div
                  key={c._id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`p-3 border rounded-xs cursor-pointer text-xs transition ${
                    selectedCandidate?._id === c._id
                      ? 'border-erp-primary bg-teal-50/80 font-semibold'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-erp-primary">{c.fullName}</span>
                    <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded">{c.tokenNumber}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1">{c.appliedProfileId?.title}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* HR Evaluation Form */}
        <div className="md:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs p-5">
          {!selectedCandidate ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <UserCheck size={36} className="mx-auto text-gray-300 mb-2" />
              Select a candidate from the left queue to conduct their final HR evaluation.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-erp-bg p-3 rounded border border-erp-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-erp-primary">{selectedCandidate.fullName}</h3>
                  <p className="text-xs text-gray-600">{selectedCandidate.appliedProfileId?.title} | Token: {selectedCandidate.tokenNumber}</p>
                </div>
                <StageBadge stage={selectedCandidate.stage} />
              </div>

              {/* Technical & Practical Summary Cards */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <span className="font-bold text-blue-900 block">Technical Score</span>
                  <span className="text-lg font-bold text-blue-800">{selectedCandidate.technicalEvaluation?.score || 0}%</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <span className="font-bold text-purple-900 block">Practical Score</span>
                  <span className="text-lg font-bold text-purple-800">{selectedCandidate.practicalEvaluation?.score || 0}%</span>
                </div>
              </div>

              {/* Behavioral Sliders / Rating */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-xs font-bold text-erp-primary uppercase">Behavioral Parameter Ratings (1 - 5 Scale)</h4>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Communication Skills:</span>
                    <span className="text-erp-primary font-bold">{commScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={commScore}
                    onChange={e => setCommScore(Number(e.target.value))}
                    className="w-full accent-erp-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Behavior & Attitude:</span>
                    <span className="text-erp-primary font-bold">{behScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={behScore}
                    onChange={e => setBehScore(Number(e.target.value))}
                    className="w-full accent-erp-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Confidence Level:</span>
                    <span className="text-erp-primary font-bold">{confScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={confScore}
                    onChange={e => setConfScore(Number(e.target.value))}
                    className="w-full accent-erp-primary"
                  />
                </div>
              </div>

              {/* Final Decision */}
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Final Hiring Verdict</label>
                    <select
                      value={verdict}
                      onChange={e => setVerdict(e.target.value)}
                      className="erp-select font-bold text-emerald-800"
                    >
                      <option value="SELECTED">SELECTED (Issue Offer Letter)</option>
                      <option value="HOLD">HOLD (Waitlist Candidate)</option>
                      <option value="REJECTED">REJECTED (Do Not Hire)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">HR Remarks & Salary Fit</label>
                    <input
                      type="text"
                      required
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Candidate notes & compensation comments..."
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setSelectedCandidate(null)} className="btn-erp-secondary">Cancel</button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-erp-primary flex items-center gap-1.5"
                  >
                    <Send size={14} /> Finalize HR Decision
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
