import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, CheckCircle, Send, Users, Edit3 } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';
import { Preloader } from '../components/common/Preloader';

export const HREvaluationWorkstation = () => {
  const { user, authFetch } = useAuth();
  const [queueCandidates, setQueueCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const [communicationScore, setCommunicationScore] = useState(4);
  const [behaviorScore, setBehaviorScore] = useState(4);
  const [confidenceScore, setConfidenceScore] = useState(4);
  const [verdict, setVerdict] = useState('SELECTED');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Edit Stage State
  const [editingCandidateStage, setEditingCandidateStage] = useState(null);
  const [newStageValue, setNewStageValue] = useState('');

  const fetchHrQueue = async () => {
    try {
      const res = await authFetch('/api/candidates');
      if (res.success) {
        const userEmpId = user?.employeeId?._id ? user.employeeId._id.toString() : (user?.employeeId ? user.employeeId.toString() : '');
        const userEmail = user?.email?.toLowerCase();
        const isSuperAdmin = user?.role?.name === 'Super Admin';

        const allCandidates = res.data || [];
        
        // STRICT STAGE SEGREGATION: Show ONLY HR_QUEUE, HR_IN_PROGRESS, or PRACTICAL_COMPLETED
        const allHr = allCandidates.filter(c => 
          c.stage === 'HR_QUEUE' || c.stage === 'HR_IN_PROGRESS' || c.stage === 'PRACTICAL_COMPLETED'
        );

        if (!isSuperAdmin && (userEmpId || userEmail)) {
          const myHr = allHr.filter(c => {
            if (!c.assignedHrInterviewer) return true; // Show unassigned
            
            const assignedIdStr = c.assignedHrInterviewer._id 
              ? c.assignedHrInterviewer._id.toString() 
              : c.assignedHrInterviewer.toString();
            
            if (userEmpId && assignedIdStr === userEmpId) return true;
            if (c.assignedHrInterviewer.email && userEmail && c.assignedHrInterviewer.email.toLowerCase() === userEmail) return true;
            
            return false;
          });
          setQueueCandidates(myHr);
        } else {
          setQueueCandidates(allHr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchHrQueue();
    const interval = setInterval(fetchHrQueue, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStageChange = async (candidateId, stageToSet) => {
    try {
      const res = await authFetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        body: JSON.stringify({ stage: stageToSet })
      });
      if (res.success) {
        alert(`Candidate stage updated to ${stageToSet}`);
        setEditingCandidateStage(null);
        fetchHrQueue();
        if (selectedCandidate && selectedCandidate._id === candidateId) {
          if (!stageToSet.includes('HR') && stageToSet !== 'PRACTICAL_COMPLETED') {
            setSelectedCandidate(null); // Exit HR view if moved out of HR!
          } else {
            setSelectedCandidate({ ...selectedCandidate, stage: stageToSet });
          }
        }
      } else {
        alert(res.message || 'Failed to update candidate stage');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setLoading(true);
    try {
      const res = await authFetch('/api/interviews/hr/submit', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: selectedCandidate._id,
          communicationScore,
          behaviorScore,
          confidenceScore,
          verdict,
          remarks
        })
      });

      if (res.success) {
        alert(`HR final evaluation submitted! Final Decision: ${verdict}`);
        setSelectedCandidate(null);
        fetchHrQueue();
      } else {
        alert(res.message || 'HR submission failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Preloader message="Loading HR Panel & Candidate Queues..." />;
  }

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <UserCheck size={18} /> HR Evaluation & Final Selection Panel
          </h2>
          <p className="text-xs text-gray-600">
            Strict HR Queue Assessment. Candidates moving to Selected/Rejected exit this queue.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Queue Sidebar */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} /> HR Queue ({queueCandidates.length})
            </h3>
            <span className="text-[10px] text-gray-500 font-semibold">Assigned & Active</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {queueCandidates.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No candidates currently assigned in your HR evaluation queue.
              </div>
            ) : (
              queueCandidates.map(c => {
                const isSelected = selectedCandidate?._id === c._id;
                return (
                  <div
                    key={c._id}
                    className={`p-3 rounded border text-xs space-y-2 transition ${
                      isSelected
                        ? 'border-erp-primary bg-teal-50/60 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-gray-900">{c.fullName}</div>
                        <div className="text-[10px] text-erp-primary font-mono">{c.candidateCode}</div>
                      </div>
                      <StageBadge stage={c.stage} />
                    </div>

                    <div className="text-[11px] text-gray-600 space-y-0.5">
                      <div>Profile: <strong>{c.appliedProfileId?.title || c.appliedProfileName}</strong></div>
                      <div>Tech Score: <strong>{c.technicalEvaluation?.score || 0}%</strong></div>
                      <div>Practical Score: <strong>{c.practicalEvaluation?.score || 0}%</strong></div>
                      {c.assignedHrInterviewer && (
                        <div className="text-[10px] text-teal-700 font-semibold">
                          Assigned to: {c.assignedHrInterviewer.fullName || 'You'}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition ${
                          isSelected ? 'bg-teal-800 text-white' : 'bg-gray-100 hover:bg-teal-800 hover:text-white text-gray-800'
                        }`}
                      >
                        <UserCheck size={13} /> {isSelected ? 'In Progress' : 'Start HR Panel'}
                      </button>

                      <button
                        onClick={() => {
                          setEditingCandidateStage(c._id);
                          setNewStageValue(c.stage);
                        }}
                        className="px-2 py-1.5 text-[11px] border border-gray-300 hover:bg-gray-200 rounded text-gray-700 font-semibold flex items-center gap-1"
                        title="Edit Stage"
                      >
                        <Edit3 size={12} /> Stage
                      </button>
                    </div>

                    {/* Inline Quick Stage Editor */}
                    {editingCandidateStage === c._id && (
                      <div className="p-2 bg-yellow-50 border border-yellow-300 rounded space-y-2 text-xs">
                        <label className="block text-[10px] font-bold text-yellow-900 uppercase">
                          Edit Round / Stage for {c.fullName}:
                        </label>
                        <select
                          value={newStageValue}
                          onChange={e => setNewStageValue(e.target.value)}
                          className="erp-select text-xs font-bold"
                        >
                          <option value="HR_QUEUE">HR_QUEUE (HR Round)</option>
                          <option value="HR_IN_PROGRESS">HR_IN_PROGRESS</option>
                          <option value="SELECTED">SELECTED (Hired)</option>
                          <option value="HOLD">HOLD (On Hold)</option>
                          <option value="REJECTED">REJECTED (Failed)</option>
                        </select>

                        <div className="flex justify-end gap-1 pt-1">
                          <button
                            onClick={() => setEditingCandidateStage(null)}
                            className="px-2 py-0.5 bg-gray-200 text-gray-800 text-[10px] rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleStageChange(c._id, newStageValue)}
                            className="px-2 py-0.5 bg-erp-primary text-white text-[10px] rounded font-bold"
                          >
                            Save Stage
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* HR Evaluation Workstation Form */}
        <div className="md:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs p-5 space-y-4">
          {loading ? (
            <Preloader message="Submitting HR Evaluation Result..." />
          ) : !selectedCandidate ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <UserCheck size={40} className="mx-auto text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">No Candidate Selected</h3>
              <p className="text-xs">Select a candidate from the queue to start behavioral and soft skills assessment.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Selected Candidate Dossier Banner */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-teal-900">{selectedCandidate.fullName}</h4>
                  <p className="text-xs text-teal-700 font-mono">{selectedCandidate.candidateCode} | {selectedCandidate.appliedProfileId?.title || selectedCandidate.appliedProfileName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <StageBadge stage={selectedCandidate.stage} />
                  <select
                    value={selectedCandidate.stage}
                    onChange={e => handleStageChange(selectedCandidate._id, e.target.value)}
                    className="erp-select text-xs font-bold text-teal-900"
                  >
                    <option value="HR_QUEUE">Stage: HR Queue</option>
                    <option value="HR_IN_PROGRESS">Stage: HR In Progress</option>
                    <option value="SELECTED">Final Decision: SELECTED</option>
                    <option value="HOLD">Final Decision: HOLD</option>
                    <option value="REJECTED">Final Decision: REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Previous Rounds Scores Summary */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Technical Round Verdict</span>
                  <strong className="text-blue-900 text-sm">
                    {selectedCandidate.technicalEvaluation?.verdict || 'PASS'} ({selectedCandidate.technicalEvaluation?.score || 0}%)
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Practical Task Verdict</span>
                  <strong className="text-purple-900 text-sm">
                    {selectedCandidate.practicalEvaluation?.verdict || 'PASS'} ({selectedCandidate.practicalEvaluation?.score || 0}%)
                  </strong>
                </div>
              </div>

              {/* Behavioral Ratings (1 to 5) */}
              <div className="space-y-3 p-4 border rounded bg-white">
                <h4 className="font-bold text-teal-900 uppercase border-b pb-1">Behavioral & Soft Skills Rating Matrix (1-5 Scale)</h4>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Communication Skills (1-5)</label>
                    <select
                      value={communicationScore}
                      onChange={e => setCommunicationScore(Number(e.target.value))}
                      className="erp-select font-bold text-teal-900"
                    >
                      {[1,2,3,4,5].map(val => (
                        <option key={val} value={val}>{val} Star{val > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Behavior & Attitude (1-5)</label>
                    <select
                      value={behaviorScore}
                      onChange={e => setBehaviorScore(Number(e.target.value))}
                      className="erp-select font-bold text-teal-900"
                    >
                      {[1,2,3,4,5].map(val => (
                        <option key={val} value={val}>{val} Star{val > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Confidence & Culture Fit (1-5)</label>
                    <select
                      value={confidenceScore}
                      onChange={e => setConfidenceScore(Number(e.target.value))}
                      className="erp-select font-bold text-teal-900"
                    >
                      {[1,2,3,4,5].map(val => (
                        <option key={val} value={val}>{val} Star{val > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* HR Remarks & Final Decision */}
              <div className="p-4 border rounded bg-gray-50 space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">HR Remarks & Offer Expectations</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Candidate notice period, salary expectations, joining date, HR feedback..."
                    className="erp-input text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">Final Decision:</span>
                    {[
                      { id: 'SELECTED', label: 'SELECTED (Hire)', color: 'text-green-700' },
                      { id: 'HOLD', label: 'HOLD', color: 'text-yellow-700' },
                      { id: 'REJECTED', label: 'REJECTED', color: 'text-red-700' }
                    ].map(d => (
                      <label key={d.id} className="flex items-center gap-1 font-bold text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="hr_decision"
                          value={d.id}
                          checked={verdict === d.id}
                          onChange={() => setVerdict(d.id)}
                        />
                        <span className={d.color}>{d.label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-teal-800 hover:bg-teal-900 text-white py-2 px-4 rounded text-xs flex items-center gap-1 font-bold"
                  >
                    <Send size={14} /> Submit Final Decision
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
