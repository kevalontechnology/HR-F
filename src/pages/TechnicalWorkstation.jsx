import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code, CheckCircle, XCircle, AlertCircle, Send, Users, Edit3, ArrowRight } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';

export const TechnicalWorkstation = () => {
  const { user, authFetch } = useAuth();
  const [queueCandidates, setQueueCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [verdict, setVerdict] = useState('PASS');
  const [loading, setLoading] = useState(false);

  // Edit Stage State
  const [editingCandidateStage, setEditingCandidateStage] = useState(null);
  const [newStageValue, setNewStageValue] = useState('');

  const fetchTechQueue = async () => {
    try {
      const res = await authFetch('/api/candidates');
      if (res.success) {
        const userEmpId = user?.employeeId?._id ? user.employeeId._id.toString() : (user?.employeeId ? user.employeeId.toString() : '');
        const userEmail = user?.email?.toLowerCase();
        const isSuperAdmin = user?.role?.name === 'Super Admin';

        const allCandidates = res.data || [];
        const allTech = allCandidates.filter(c => {
          if (c.stage === 'SELECTED' || c.stage === 'REJECTED' || c.stage === 'HOLD') return false;
          // Show candidates in technical queue/in progress OR assigned to this technical interviewer
          return c.stage.includes('TECHNICAL') || c.assignedTechnicalInterviewer;
        });

        if (!isSuperAdmin && (userEmpId || userEmail)) {
          const myTech = allTech.filter(c => {
            if (!c.assignedTechnicalInterviewer) return true; // Show unassigned candidates
            
            const assignedIdStr = c.assignedTechnicalInterviewer._id 
              ? c.assignedTechnicalInterviewer._id.toString() 
              : c.assignedTechnicalInterviewer.toString();
            
            if (userEmpId && assignedIdStr === userEmpId) return true;
            if (c.assignedTechnicalInterviewer.email && userEmail && c.assignedTechnicalInterviewer.email.toLowerCase() === userEmail) return true;
            
            return false;
          });
          setQueueCandidates(myTech);
        } else {
          setQueueCandidates(allTech);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTechQueue();
    const interval = setInterval(fetchTechQueue, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const loadCandidateQuestions = async (candidate) => {
    setSelectedCandidate(candidate);
    setLoading(true);
    try {
      const res = await authFetch(`/api/interviews/technical/${candidate._id}/questions`);
      if (res.success) {
        setQuestions(res.questions || []);
        const initAns = {};
        (res.questions || []).forEach((q) => {
          initAns[q._id] = { isCorrect: true, remarks: '' };
        });
        setAnswers(initAns);
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
        fetchTechQueue();
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
      const questionResponses = Object.keys(answers).map(qId => ({
        questionId: qId,
        questionText: questions.find(q => q._id === qId)?.questionText || '',
        skillName: questions.find(q => q._id === qId)?.skillId?.name || '',
        isCorrect: answers[qId].isCorrect,
        remarks: answers[qId].remarks
      }));

      const res = await authFetch('/api/interviews/technical/submit', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: selectedCandidate._id,
          verdict,
          remarks: generalRemarks,
          questions: questionResponses
        })
      });

      if (res.success) {
        alert(`Technical evaluation submitted! Verdict: ${verdict}`);
        setSelectedCandidate(null);
        setQuestions([]);
        fetchTechQueue();
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
            <Code size={18} /> Technical Interview Workstation
          </h2>
          <p className="text-xs text-gray-600">
            Conduct 10-Question technical evaluations, grade answers, change candidate stage, and route candidate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Queue Sidebar */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} /> Technical Queue ({queueCandidates.length})
            </h3>
            <span className="text-[10px] text-gray-500 font-semibold">Assigned & Active</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {queueCandidates.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No candidates currently assigned in your technical queue.
              </div>
            ) : (
              queueCandidates.map(c => {
                const isSelected = selectedCandidate?._id === c._id;
                return (
                  <div
                    key={c._id}
                    className={`p-3 rounded border text-xs space-y-2 transition ${
                      isSelected
                        ? 'border-erp-primary bg-blue-50/60 shadow-xs'
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
                      <div>Mobile: <strong>{c.mobile}</strong></div>
                      {c.assignedTechnicalInterviewer && (
                        <div className="text-[10px] text-indigo-700 font-semibold">
                          Assigned to: {c.assignedTechnicalInterviewer.fullName || 'You'}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Start Evaluation & Edit Stage */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                      <button
                        onClick={() => loadCandidateQuestions(c)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition ${
                          isSelected ? 'bg-erp-primary text-white' : 'bg-gray-100 hover:bg-erp-primary hover:text-white text-gray-800'
                        }`}
                      >
                        <Code size={13} /> {isSelected ? 'In Progress' : 'Start Test'}
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
                          <option value="TECHNICAL_QUEUE">TECHNICAL_QUEUE (Technical Round)</option>
                          <option value="TECHNICAL_IN_PROGRESS">TECHNICAL_IN_PROGRESS</option>
                          <option value="TECHNICAL_COMPLETED">TECHNICAL_COMPLETED</option>
                          <option value="PRACTICAL_QUEUE">PRACTICAL_QUEUE (Practical Round)</option>
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

        {/* Technical Evaluation Workstation Form */}
        <div className="md:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs p-5 space-y-4">
          {!selectedCandidate ? (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <Code size={40} className="mx-auto text-gray-400" />
              <h3 className="font-bold text-sm text-gray-700">No Candidate Selected</h3>
              <p className="text-xs">Select a candidate from the left queue to load 10 random technical questions drawer.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              {/* Selected Candidate Header Dossier */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-blue-900">{selectedCandidate.fullName}</h4>
                  <p className="text-xs text-blue-700 font-mono">{selectedCandidate.candidateCode} | {selectedCandidate.appliedProfileId?.title || selectedCandidate.appliedProfileName}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <StageBadge stage={selectedCandidate.stage} />
                  <select
                    value={selectedCandidate.stage}
                    onChange={e => handleStageChange(selectedCandidate._id, e.target.value)}
                    className="erp-select text-xs font-bold text-erp-primary"
                  >
                    <option value="TECHNICAL_QUEUE">Stage: Technical Queue</option>
                    <option value="TECHNICAL_IN_PROGRESS">Stage: Technical In Progress</option>
                    <option value="TECHNICAL_COMPLETED">Stage: Technical Completed</option>
                    <option value="PRACTICAL_QUEUE">Push to: Practical Queue</option>
                    <option value="HR_QUEUE">Push to: HR Queue</option>
                    <option value="SELECTED">Decision: Selected</option>
                    <option value="HOLD">Decision: Hold</option>
                    <option value="REJECTED">Decision: Rejected</option>
                  </select>
                </div>
              </div>

              {/* Technical Questions List Drawer */}
              <div className="space-y-3">
                <h4 className="font-bold text-erp-primary uppercase border-b pb-1">Technical Question Bank (10 Questions Drawer)</h4>
                
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading technical questions...</div>
                ) : questions.length === 0 ? (
                  <div className="p-4 text-center text-red-600 bg-red-50 rounded">
                    No questions found for this candidate profile. You can still set the verdict below.
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q._id} className="p-3 border border-gray-200 rounded space-y-2 bg-gray-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-gray-900">Q{idx + 1}. {q.questionText}</span>
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded">
                          {q.skillId?.name || 'General'} ({q.difficulty})
                        </span>
                      </div>

                      {q.expectedAnswer && (
                        <p className="text-[11px] text-gray-600 italic bg-white p-2 border rounded">
                          Expected Answer Key: {q.expectedAnswer}
                        </p>
                      )}

                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1 font-semibold text-green-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`q_${q._id}`}
                            checked={answers[q._id]?.isCorrect === true}
                            onChange={() => setAnswers({ ...answers, [q._id]: { ...answers[q._id], isCorrect: true } })}
                          /> Correct
                        </label>

                        <label className="flex items-center gap-1 font-semibold text-red-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`q_${q._id}`}
                            checked={answers[q._id]?.isCorrect === false}
                            onChange={() => setAnswers({ ...answers, [q._id]: { ...answers[q._id], isCorrect: false } })}
                          /> Incorrect
                        </label>

                        <input
                          type="text"
                          placeholder="Interviewer Remarks..."
                          value={answers[q._id]?.remarks || ''}
                          onChange={e => setAnswers({ ...answers, [q._id]: { ...answers[q._id], remarks: e.target.value } })}
                          className="erp-input flex-1 text-xs"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* General Remarks & Final Verdict */}
              <div className="p-4 border rounded bg-gray-50 space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Overall Technical Remarks</label>
                  <textarea
                    rows={2}
                    value={generalRemarks}
                    onChange={e => setGeneralRemarks(e.target.value)}
                    placeholder="Candidate technical strengths, weak areas, code clarity..."
                    className="erp-input text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">Final Verdict:</span>
                    {['PASS', 'HOLD', 'FAIL'].map(v => (
                      <label key={v} className="flex items-center gap-1 font-bold text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="verdict"
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
                    className="btn-erp-primary py-2 px-4 flex items-center gap-1 font-bold"
                  >
                    <Send size={14} /> Submit Evaluation Result
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
