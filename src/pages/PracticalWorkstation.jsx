import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, CheckCircle, XCircle, Send, Users, Edit3 } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';

export const PracticalWorkstation = () => {
  const { user, authFetch } = useAuth();
  const [queueCandidates, setQueueCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [marks, setMarks] = useState({});
  const [taskRemarks, setTaskRemarks] = useState({});
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [verdict, setVerdict] = useState('PASS');
  const [loading, setLoading] = useState(false);

  // Edit Stage State
  const [editingCandidateStage, setEditingCandidateStage] = useState(null);
  const [newStageValue, setNewStageValue] = useState('');

  const fetchPracticalQueue = async () => {
    try {
      const res = await authFetch('/api/candidates');
      if (res.success) {
        const userEmpId = user?.employeeId?._id ? user.employeeId._id.toString() : (user?.employeeId ? user.employeeId.toString() : '');
        const userEmail = user?.email?.toLowerCase();
        const isSuperAdmin = user?.role?.name === 'Super Admin';

        const allCandidates = res.data || [];
        const allPractical = allCandidates.filter(c => {
          if (c.stage === 'SELECTED' || c.stage === 'REJECTED' || c.stage === 'HOLD') return false;
          return c.stage.includes('PRACTICAL') || c.stage === 'TECHNICAL_COMPLETED' || c.assignedPracticalInterviewer;
        });

        if (!isSuperAdmin && (userEmpId || userEmail)) {
          const myPractical = allPractical.filter(c => {
            if (!c.assignedPracticalInterviewer) return true; // Show unassigned
            
            const assignedIdStr = c.assignedPracticalInterviewer._id 
              ? c.assignedPracticalInterviewer._id.toString() 
              : c.assignedPracticalInterviewer.toString();
            
            if (userEmpId && assignedIdStr === userEmpId) return true;
            if (c.assignedPracticalInterviewer.email && userEmail && c.assignedPracticalInterviewer.email.toLowerCase() === userEmail) return true;
            
            return false;
          });
          setQueueCandidates(myPractical);
        } else {
          setQueueCandidates(allPractical);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPracticalQueue();
    const interval = setInterval(fetchPracticalQueue, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const loadCandidateTasks = async (candidate) => {
    setSelectedCandidate(candidate);
    setLoading(true);
    try {
      const res = await authFetch(`/api/interviews/practical/${candidate._id}/tasks`);
      if (res.success) {
        setTasks(res.tasks || []);
        const initMarks = {};
        const initRemarks = {};
        (res.tasks || []).forEach(t => {
          initMarks[t._id] = t.maxMarks || 50;
          initRemarks[t._id] = '';
        });
        setMarks(initMarks);
        setTaskRemarks(initRemarks);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (candidateId, stageToSet) => {
    try {
      const res = await authFetch(`/api/candidates/${candidateId}`, {
        method: 'PUT',
        body: JSON.stringify({ stage: stageToSet })
      });
      if (res.success) {
        alert(`Candidate stage updated to ${stageToSet}`);
        setEditingCandidateStage(null);
        fetchPracticalQueue();
        if (selectedCandidate && selectedCandidate._id === candidateId) {
          setSelectedCandidate({ ...selectedCandidate, stage: stageToSet });
        }
      } else {
        alert(res.message || 'Failed to update candidate stage');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setLoading(true);
    try {
      const taskResponses = Object.keys(marks).map(tId => ({
        taskId: tId,
        taskTitle: tasks.find(t => t._id === tId)?.taskTitle || tasks.find(t => t._id === tId)?.title || '',
        maxMarks: tasks.find(t => t._id === tId)?.maxMarks || 50,
        marksObtained: Number(marks[tId]) || 0,
        remarks: taskRemarks[tId] || ''
      }));

      const res = await authFetch('/api/interviews/practical/submit', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: selectedCandidate._id,
          verdict,
          remarks: generalRemarks,
          tasks: taskResponses
        })
      });

      if (res.success) {
        alert(`Practical task evaluation submitted! Verdict: ${verdict}`);
        setSelectedCandidate(null);
        setTasks([]);
        fetchPracticalQueue();
      } else {
        alert(res.message || 'Evaluation submission failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Terminal size={18} /> Practical Task Workstation
          </h2>
          <p className="text-xs text-gray-600">
            Evaluate coding tasks, review live code implementations, edit candidate stage, and route candidate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Queue Sidebar */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} /> Practical Queue ({queueCandidates.length})
            </h3>
            <span className="text-[10px] text-gray-500 font-semibold">Assigned & Active</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {queueCandidates.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No candidates currently assigned in your practical task queue.
              </div>
            ) : (
              queueCandidates.map(c => {
                const isSelected = selectedCandidate?._id === c._id;
                return (
                  <div
                    key={c._id}
                    className={`p-3 rounded border text-xs space-y-2 transition ${
                      isSelected
                        ? 'border-erp-primary bg-purple-50/60 shadow-xs'
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
                      <div>Tech Verdict: <strong className="text-green-700">{c.technicalEvaluation?.verdict || 'PASS'}</strong></div>
                      {c.assignedPracticalInterviewer && (
                        <div className="text-[10px] text-purple-700 font-semibold">
                          Assigned to: {c.assignedPracticalInterviewer.fullName || 'You'}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Start Task Test & Edit Stage */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                      <button
                        onClick={() => loadCandidateTasks(c)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition ${
                          isSelected ? 'bg-purple-800 text-white' : 'bg-gray-100 hover:bg-purple-800 hover:text-white text-gray-800'
                        }`}
                      >
                        <Terminal size={13} /> {isSelected ? 'Evaluating Code' : 'Evaluate Task'}
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
                          <option value="PRACTICAL_QUEUE">PRACTICAL_QUEUE (Practical Round)</option>
                          <option value="PRACTICAL_IN_PROGRESS">PRACTICAL_IN_PROGRESS</option>
                          <option value="PRACTICAL_COMPLETED">PRACTICAL_COMPLETED</option>
                          <option value="HR_QUEUE">HR_QUEUE (HR Round)</option>
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

        {/* Practical Evaluation Workstation Form */}
        <div className="md:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs p-5 space-y-4">
          {!selectedCandidate ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <Terminal size={40} className="mx-auto text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">No Candidate Selected</h3>
              <p className="text-xs">Select a candidate from the queue to load practical tasks and code marking matrix.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              {/* Selected Candidate Header Dossier */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-purple-900">{selectedCandidate.fullName}</h4>
                  <p className="text-xs text-purple-700 font-mono">{selectedCandidate.candidateCode} | {selectedCandidate.appliedProfileId?.title || selectedCandidate.appliedProfileName}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <StageBadge stage={selectedCandidate.stage} />
                  <select
                    value={selectedCandidate.stage}
                    onChange={e => handleStageChange(selectedCandidate._id, e.target.value)}
                    className="erp-select text-xs font-bold text-purple-900"
                  >
                    <option value="PRACTICAL_QUEUE">Stage: Practical Queue</option>
                    <option value="PRACTICAL_IN_PROGRESS">Stage: Practical In Progress</option>
                    <option value="PRACTICAL_COMPLETED">Stage: Practical Completed</option>
                    <option value="HR_QUEUE">Push to: HR Queue</option>
                    <option value="SELECTED">Decision: Selected</option>
                    <option value="HOLD">Decision: Hold</option>
                    <option value="REJECTED">Decision: Rejected</option>
                  </select>
                </div>
              </div>

              {/* Tasks List Drawer */}
              <div className="space-y-3">
                <h4 className="font-bold text-purple-900 uppercase border-b pb-1">Practical Task Bank (Assigned Tasks)</h4>
                
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading practical tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="p-4 text-center text-red-600 bg-red-50 rounded">
                    No practical tasks found for this profile. You can still grade candidate performance below.
                  </div>
                ) : (
                  tasks.map((t, idx) => (
                    <div key={t._id} className="p-3 border border-purple-200 rounded space-y-2 bg-purple-50/20">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-purple-950 text-sm">Task #{idx + 1}: {t.taskTitle || t.title}</span>
                        <span className="px-2 py-0.5 bg-purple-200 text-purple-900 text-[10px] font-bold rounded">
                          Max Marks: {t.maxMarks || 50}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 bg-white p-2 border rounded font-mono">
                        {t.taskDescription || t.problemStatement}
                      </p>

                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-1">
                            Marks Obtained (Out of {t.maxMarks || 50})
                          </label>
                          <input
                            type="number"
                            max={t.maxMarks || 50}
                            min={0}
                            value={marks[t._id] || 0}
                            onChange={e => setMarks({ ...marks, [t._id]: e.target.value })}
                            className="erp-input font-bold text-purple-900"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-gray-700 mb-1">
                            Code Quality & Logic Remarks
                          </label>
                          <input
                            type="text"
                            placeholder="Code architecture, error handling, syntax..."
                            value={taskRemarks[t._id] || ''}
                            onChange={e => setTaskRemarks({ ...taskRemarks, [t._id]: e.target.value })}
                            className="erp-input text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* General Remarks & Final Verdict */}
              <div className="p-4 border rounded bg-gray-50 space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Overall Practical Task Summary</label>
                  <textarea
                    rows={2}
                    value={generalRemarks}
                    onChange={e => setGeneralRemarks(e.target.value)}
                    placeholder="Candidate execution speed, problem solving skills..."
                    className="erp-input text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">Practical Verdict:</span>
                    {['PASS', 'HOLD', 'FAIL'].map(v => (
                      <label key={v} className="flex items-center gap-1 font-bold text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="p_verdict"
                          value={v}
                          checked={verdict === v}
                          onChange={() => setVerdict(v)}
                        />
                        <span className={v === 'PASS' ? 'text-green-700' : v === 'HOLD' ? 'text-yellow-700' : 'text-red-700'}>
                          {v}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-800 hover:bg-purple-900 text-white py-2 px-4 rounded text-xs flex items-center gap-1 font-bold"
                  >
                    <Send size={14} /> Submit Practical Marks
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
