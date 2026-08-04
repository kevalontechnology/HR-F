import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, KeyRound, Search, Ticket, FileCode, ShieldAlert, CheckCircle2, Building2, Clock, Sparkles } from 'lucide-react';
import logoImg from '../Kevalon_Technology_Logo_Transparent.png';
import { StageBadge } from '../components/common/Badge';

export const Login = () => {
  const { login, loading } = useAuth();
  
  // Tab State: 'candidate' or 'employee'
  const [activeTab, setActiveTab] = useState('candidate');

  // Employee Login State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  // Public Candidate Tracker State (No Login Required)
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [candidateResult, setCandidateResult] = useState(null);
  const [practicalTasks, setPracticalTasks] = useState([]);
  const [searchError, setSearchError] = useState('');

  // STRICT ANTI-COPY & RIGHT-CLICK DISABLE ON PORTAL
  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    const disableCopy = (e) => {
      if (activeTab === 'candidate' && candidateResult) {
        e.preventDefault();
        alert("Copying text and inspecting practical tasks is strictly disabled.");
        return false;
      }
    };

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('copy', disableCopy);
    document.addEventListener('cut', disableCopy);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('copy', disableCopy);
      document.removeEventListener('cut', disableCopy);
    };
  }, [activeTab, candidateResult]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (!res.success) {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleCandidateSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');
    setCandidateResult(null);
    setPracticalTasks([]);

    try {
      const response = await fetch(`/api/candidates/public-status?query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();

      if (data.success) {
        setCandidateResult(data.candidate);
        setPracticalTasks(data.practicalTasks || []);
      } else {
        setSearchError(data.message || 'Candidate record not found.');
      }
    } catch (err) {
      setSearchError('Network error. Please try searching again.');
    } finally {
      setSearching(false);
    }
  };

  const setFastCredentials = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
  };

  return (
    <div className="min-h-screen bg-erp-bg flex flex-col justify-center items-center p-4 select-none" onContextMenu={e => e.preventDefault()}>
      {/* Outer Card Container */}
      <div className="w-full max-w-xl bg-white border border-erp-border shadow-lg rounded-xs overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-erp-primary text-white p-6 text-center border-b-4 border-erp-primaryHover flex flex-col items-center">
          <img src={logoImg} alt="Kevalon Technology Logo" className="h-12 w-auto object-contain mb-2 drop-shadow-sm pointer-events-none" />
          <h2 className="text-xl font-bold uppercase tracking-wider">Kevalon Technology</h2>
          <p className="text-xs text-gray-200 uppercase tracking-widest font-semibold mt-1">
            Recruitment CRM & Candidate Portal
          </p>
        </div>

        {/* Portal Mode Tab Switcher */}
        <div className="flex border-b border-erp-border bg-gray-50 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('candidate')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'candidate'
                ? 'border-erp-primary text-erp-primary bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Ticket size={16} /> Candidate Status & Task Portal
          </button>

          <button
            onClick={() => setActiveTab('employee')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'employee'
                ? 'border-erp-primary text-erp-primary bg-white shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Lock size={16} /> Employee Sign In
          </button>
        </div>

        {/* TAB 1: PUBLIC CANDIDATE STATUS & PRACTICAL TASK VIEWER */}
        {activeTab === 'candidate' && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-erp-primary uppercase tracking-wide flex items-center justify-center gap-1.5">
                <Search size={16} /> Track Candidate Live Interview Status
              </h3>
              <p className="text-xs text-gray-600">
                Enter your Candidate Code (e.g. CAND-1001), Token Number, Mobile Number, or Enrollment No.
              </p>
            </div>

            {/* Candidate Search Form */}
            <form onSubmit={handleCandidateSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. CAND-1073 or 8200925369"
                  className="erp-input pl-9 pr-24 text-xs font-semibold py-2.5"
                />
                <Ticket className="absolute left-3 top-3 text-erp-primary" size={16} />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-1 top-1 bottom-1 btn-erp-primary px-3 text-xs font-bold flex items-center gap-1"
                >
                  <Search size={13} /> {searching ? 'Searching...' : 'Check Status'}
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-semibold rounded text-center">
                {searchError}
              </div>
            )}

            {/* Candidate Status & Dossier Result Card */}
            {candidateResult && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono font-bold block">{candidateResult.candidateCode}</span>
                      <h4 className="font-bold text-base text-blue-950">{candidateResult.fullName}</h4>
                    </div>
                    <StageBadge stage={candidateResult.stage} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-gray-700 pt-1">
                    <div>Token #: <strong className="text-erp-primary font-mono">{candidateResult.tokenNumber}</strong></div>
                    <div>Profile: <strong>{candidateResult.appliedProfileName}</strong></div>
                    <div>College: <strong>{candidateResult.collegeName}</strong></div>
                    <div>Branch: <strong>{candidateResult.branch}</strong></div>
                  </div>
                </div>

                {/* PRACTICAL TASKS SECTION (WITH STRICT ANTI-COPY PROTECTION) */}
                {(candidateResult.stage.includes('PRACTICAL') || candidateResult.stage === 'TECHNICAL_COMPLETED') ? (
                  <div 
                    className="p-4 border border-purple-300 bg-purple-50/40 rounded space-y-3 select-none pointer-events-auto"
                    onCopy={(e) => { e.preventDefault(); alert("Copying is disabled."); }}
                    onCut={(e) => { e.preventDefault(); alert("Copying is disabled."); }}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none' }}
                  >
                    <div className="flex items-center justify-between border-b border-purple-200 pb-1 text-purple-900">
                      <h4 className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                        <FileCode size={16} /> Assigned Practical Tasks
                      </h4>
                      <span className="text-[10px] bg-purple-200 text-purple-950 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldAlert size={12} /> Protected (Copying Disabled)
                      </span>
                    </div>

                    {practicalTasks.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-500">
                        Task drawer loading... Please refresh if not loaded.
                      </div>
                    ) : (
                      practicalTasks.map((task, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 bg-white border border-purple-200 rounded space-y-2 shadow-2xs select-none"
                          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-purple-950 text-xs">Task #{idx + 1}: {task.taskTitle}</span>
                            <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 rounded">
                              Max Marks: {task.maxMarks} ({task.expectedTimeMinutes} mins)
                            </span>
                          </div>

                          <p className="text-xs text-gray-800 font-mono bg-purple-50/50 p-2.5 border rounded leading-relaxed select-none">
                            {task.taskDescription}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border rounded text-center text-xs text-gray-600">
                    Your current interview stage is <strong>{candidateResult.stage}</strong>. Practical tasks will appear here once pushed to Practical Round.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EMPLOYEE SIGN IN PORTAL */}
        {activeTab === 'employee' && (
          <div>
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-semibold rounded-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <User size={13} /> Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="erp-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <Lock size={13} /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="erp-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-erp-primary py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound size={15} />
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>

            {/* Quick Demo Role Selector */}
            <div className="p-4 bg-erp-bg border-t border-erp-border text-center">
              <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Quick Sign-In Presets:
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-[11px]">
                <button
                  onClick={() => setFastCredentials('admin', 'Admin@123')}
                  className="px-2.5 py-1 bg-erp-primary text-white rounded-xs font-semibold hover:opacity-90"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => setFastCredentials('vikram.tech', 'Tech@123')}
                  className="px-2.5 py-1 bg-blue-700 text-white rounded-xs font-semibold hover:opacity-90"
                >
                  Technical Panel
                </button>
                <button
                  onClick={() => setFastCredentials('pooja.reception', 'Pooja@123')}
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded-xs font-semibold hover:opacity-90"
                >
                  Receptionist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Kevalon Technology Enterprise Systems. All rights reserved.
      </div>
    </div>
  );
};
