import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Send } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';

export const PracticalWorkstation = () => {
  const { user, authFetch } = useAuth();
  const [queueCandidates, setQueueCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskMarks, setTaskMarks] = useState({});
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [verdict, setVerdict] = useState('PASS');
  const [loading, setLoading] = useState(false);

  const fetchPracticalQueue = async () => {
    try {
      const res = await authFetch('/api/candidates');
      if (res.success) {
        const allPractical = (res.data || []).filter(c => 
          c.stage === 'PRACTICAL_QUEUE' || c.stage === 'PRACTICAL_IN_PROGRESS' || c.stage === 'TECHNICAL_COMPLETED'
        );

        if (user?.employeeId && user?.role?.name !== 'Super Admin') {
          const empIdStr = user.employeeId._id ? user.employeeId._id.toString() : user.employeeId.toString();
          const myPractical = allPractical.filter(c => {
            const assignedId = c.assignedPracticalInterviewer?._id 
              ? c.assignedPracticalInterviewer._id.toString() 
              : c.assignedPracticalInterviewer?.toString();
            return assignedId === empIdStr || !assignedId;
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
        const init = {};
        (res.tasks || []).forEach(t => {
          init[t._id] = { marksObtained: 80, remarks: '' };
        });
        setTaskMarks(init);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMarkChange = (tId, field, val) => {
    setTaskMarks(prev => ({
      ...prev,
      [tId]: { ...prev[tId], [field]: val }
    }));
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    try {
      const payload = {
        tasks: tasks.map(t => ({
          taskId: t._id,
          taskTitle: t.taskTitle,
          maxMarks: t.maxMarks || 100,
          marksObtained: Number(taskMarks[t._id]?.marksObtained || 0),
          remarks: taskMarks[t._id]?.remarks || ''
        })),
        verdict,
        remarks: generalRemarks
      };

      const res = await authFetch(`/api/interviews/practical/${selectedCandidate._id}/evaluate`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        alert(res.message);
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
    <div className="space-y-6">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Terminal size={18} /> Practical Task Interviewer Workstation
          </h2>
          <p className="text-xs text-gray-600">
            Random 2 Practical Tasks drawer, live execution evaluation & code marking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Practical Queue List */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider border-b pb-2 flex items-center justify-between">
            <span>Practical Queue Candidates</span>
            <span className="bg-erp-primary text-white px-2 py-0.5 rounded text-[10px]">{queueCandidates.length}</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {queueCandidates.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No candidates in practical queue.</p>
            ) : (
              queueCandidates.map(c => (
                <div
                  key={c._id}
                  onClick={() => loadCandidateTasks(c)}
                  className={`p-3 border rounded-xs cursor-pointer text-xs transition ${
                    selectedCandidate?._id === c._id
                      ? 'border-erp-primary bg-purple-50/80 font-semibold'
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

        {/* Practical Tasks Drawer Form */}
        <div className="md:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs p-5">
          {!selectedCandidate ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <Terminal size={36} className="mx-auto text-gray-300 mb-2" />
              Select a candidate from the queue to open their Random 2 Practical Tasks drawer.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-erp-bg p-3 rounded border border-erp-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-erp-primary">{selectedCandidate.fullName}</h3>
                  <p className="text-xs text-gray-600">{selectedCandidate.appliedProfileId?.title} | Token: {selectedCandidate.tokenNumber}</p>
                </div>
                <StageBadge stage={selectedCandidate.stage} />
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-erp-primary uppercase border-b pb-1">
                  Assigned Random 2 Practical Tasks
                </h4>

                {tasks.map((t, idx) => (
                  <div key={t._id} className="p-3 border border-gray-200 rounded bg-gray-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900">Task #{idx + 1}: {t.taskTitle}</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                        Est Time: {t.expectedTimeMinutes} mins | Max Marks: {t.maxMarks}
                      </span>
                    </div>

                    <p className="text-gray-700 bg-white p-2 border rounded text-[11px]">{t.taskDescription}</p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Marks Awarded (Max: {t.maxMarks})</label>
                        <input
                          type="number"
                          max={t.maxMarks}
                          min="0"
                          value={taskMarks[t._id]?.marksObtained ?? 80}
                          onChange={e => handleTaskMarkChange(t._id, 'marksObtained', e.target.value)}
                          className="erp-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">Code Quality / Execution Remarks</label>
                        <input
                          type="text"
                          placeholder="Feedback..."
                          value={taskMarks[t._id]?.remarks || ''}
                          onChange={e => handleTaskMarkChange(t._id, 'remarks', e.target.value)}
                          className="erp-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verdict & Submit */}
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Practical Stage Verdict</label>
                    <select
                      value={verdict}
                      onChange={e => setVerdict(e.target.value)}
                      className="erp-select font-bold"
                    >
                      <option value="PASS">PASS (Proceed to HR Stage)</option>
                      <option value="HOLD">HOLD (Put Candidate on Hold)</option>
                      <option value="FAIL">FAIL (Reject Candidate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">General Remarks</label>
                    <input
                      type="text"
                      value={generalRemarks}
                      onChange={e => setGeneralRemarks(e.target.value)}
                      className="erp-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button onClick={() => setSelectedCandidate(null)} className="btn-erp-secondary">Cancel</button>
                  <button
                    onClick={handleSubmitEvaluation}
                    disabled={loading}
                    className="btn-erp-primary flex items-center gap-1.5"
                  >
                    <Send size={14} /> Submit Practical Evaluation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
