import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code, CheckCircle, XCircle, AlertCircle, Send, Users } from 'lucide-react';
import { StageBadge } from '../components/common/Badge';

export const TechnicalWorkstation = () => {
  const { authFetch } = useAuth();
  const [queueCandidates, setQueueCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [verdict, setVerdict] = useState('PASS');
  const [loading, setLoading] = useState(false);

  const fetchTechQueue = async () => {
    try {
      const res = await authFetch('/api/candidates');
      if (res.success) {
        setQueueCandidates(
          (res.data || []).filter(c => 
            c.stage === 'TECHNICAL_QUEUE' || c.stage === 'TECHNICAL_IN_PROGRESS'
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTechQueue();
  }, []);

  const loadCandidateQuestions = async (candidate) => {
    setSelectedCandidate(candidate);
    setLoading(true);
    try {
      const res = await authFetch(`/api/interviews/technical/${candidate._id}/questions`);
      if (res.success) {
        setQuestions(res.questions || []);
        // Initialize default answers
        const initAns = {};
        (res.questions || []).forEach((q, idx) => {
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

  const handleAnswerChange = (qId, field, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...prev[qId], [field]: val }
    }));
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedCandidate) return;
    setLoading(true);
    try {
      const payload = {
        questions: questions.map(q => ({
          questionId: q._id,
          questionText: q.questionText,
          skillName: q.skillId?.name || 'General',
          isCorrect: answers[q._id]?.isCorrect ?? true,
          remarks: answers[q._id]?.remarks || ''
        })),
        verdict,
        remarks: generalRemarks
      };

      const res = await authFetch(`/api/interviews/technical/${selectedCandidate._id}/evaluate`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        alert(res.message);
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
    <div className="space-y-6">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Code size={18} /> Technical Interviewer Workstation
          </h2>
          <p className="text-xs text-gray-600">
            Random 10 Technical Questions drawer, live scoring, pass/hold/fail decision.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Technical Candidate Queue List */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 space-y-3">
          <h3 className="text-xs font-bold text-erp-primary uppercase tracking-wider border-b pb-2 flex items-center justify-between">
            <span>Candidates in Queue</span>
            <span className="bg-erp-primary text-white px-2 py-0.5 rounded text-[10px]">{queueCandidates.length}</span>
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {queueCandidates.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No candidates in technical queue.</p>
            ) : (
              queueCandidates.map(c => (
                <div
                  key={c._id}
                  onClick={() => loadCandidateQuestions(c)}
                  className={`p-3 border rounded-xs cursor-pointer text-xs transition ${
                    selectedCandidate?._id === c._id
                      ? 'border-erp-primary bg-blue-50/80 font-semibold'
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

        {/* Technical Question Drawer & Evaluation Form */}
        <div className="md:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs p-5">
          {!selectedCandidate ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <Code size={36} className="mx-auto text-gray-300 mb-2" />
              Please select a candidate from the left queue to launch their Random 10 Technical Questions drawer.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Candidate Info Header */}
              <div className="bg-erp-bg p-3 rounded border border-erp-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-erp-primary">{selectedCandidate.fullName}</h3>
                  <p className="text-xs text-gray-600">{selectedCandidate.appliedProfileId?.title} | Token: {selectedCandidate.tokenNumber}</p>
                </div>
                <StageBadge stage={selectedCandidate.stage} />
              </div>

              {/* 10 Random Questions List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-erp-primary uppercase border-b pb-1">
                  Random Technical Question Drawer ({questions.length} Questions)
                </h4>

                {questions.map((q, idx) => (
                  <div key={q._id} className="p-3 border border-gray-200 rounded bg-gray-50 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-gray-900">Q{idx + 1}. {q.questionText}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase font-semibold">
                        {q.skillId?.name || 'General'}
                      </span>
                    </div>

                    {q.expectedAnswer && (
                      <div className="text-[11px] text-gray-600 bg-white p-2 border rounded">
                        <strong>Expected Answer Key:</strong> {q.expectedAnswer}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-1">
                      <label className="inline-flex items-center gap-1 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${q._id}`}
                          checked={answers[q._id]?.isCorrect === true}
                          onChange={() => handleAnswerChange(q._id, 'isCorrect', true)}
                          className="text-green-600"
                        />
                        <span className="text-green-700">True (Correct)</span>
                      </label>

                      <label className="inline-flex items-center gap-1 font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${q._id}`}
                          checked={answers[q._id]?.isCorrect === false}
                          onChange={() => handleAnswerChange(q._id, 'isCorrect', false)}
                          className="text-red-600"
                        />
                        <span className="text-red-700">False (Incorrect)</span>
                      </label>

                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={answers[q._id]?.remarks || ''}
                        onChange={e => handleAnswerChange(q._id, 'remarks', e.target.value)}
                        className="erp-input flex-1 py-1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Verdict & Remarks Submission */}
              <div className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Final Technical Verdict</label>
                    <select
                      value={verdict}
                      onChange={e => setVerdict(e.target.value)}
                      className="erp-select font-bold"
                    >
                      <option value="PASS">PASS (Proceed to Practical Stage)</option>
                      <option value="HOLD">HOLD (Put Candidate on Hold)</option>
                      <option value="FAIL">FAIL (Reject Candidate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">General Technical Remarks</label>
                    <input
                      type="text"
                      value={generalRemarks}
                      onChange={e => setGeneralRemarks(e.target.value)}
                      placeholder="Overall feedback..."
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
                    <Send size={14} /> Submit Technical Evaluation
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
