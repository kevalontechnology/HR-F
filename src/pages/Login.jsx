import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, User, KeyRound, Search, Ticket, FileCode, ShieldCheck, 
  CheckCircle2, Building2, Clock, Sparkles, ArrowRight, ShieldAlert, BadgeCheck, UserCheck, Mail, Phone, Briefcase 
} from 'lucide-react';
import logoImg from '../Kevalon_Technology_Logo_Transparent.png';
import { StageBadge } from '../components/common/Badge';
import { CandidatePortal } from './CandidatePortal';
import { CareersPage } from './CareersPage';
import { getApiUrl } from '../config/api';

export const Login = () => {
  const { login, loading } = useAuth();
  
  // Tab State: 'careers' | 'candidate_login' | 'candidate_track' | 'employee'
  const [activeTab, setActiveTab] = useState('careers');

  // Candidate Authentication State (Requires BOTH Email AND Mobile Number)
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateMobile, setCandidateMobile] = useState('');
  const [candidateAuthLoading, setCandidateAuthLoading] = useState(false);
  const [candidateAuthError, setCandidateAuthError] = useState('');
  const [loggedInCandidate, setLoggedInCandidate] = useState(() => {
    const saved = localStorage.getItem('kevalon_candidate');
    return saved ? JSON.parse(saved) : null;
  });

  // Employee Login State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  // Quick Tracker Search State
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
      e.preventDefault();
      alert("Copying text and inspecting practical tasks is strictly disabled.");
      return false;
    };

    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('copy', disableCopy);
    document.addEventListener('cut', disableCopy);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('copy', disableCopy);
      document.removeEventListener('cut', disableCopy);
    };
  }, []);

  const handleCandidateLogin = async (e) => {
    e.preventDefault();
    if (!candidateEmail.trim() || !candidateMobile.trim()) {
      setCandidateAuthError('Both Email Address AND Mobile Number are strictly required.');
      return;
    }

    setCandidateAuthLoading(true);
    setCandidateAuthError('');

    try {
      const fullUrl = getApiUrl('/api/auth/candidate-login');
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: candidateEmail, mobile: candidateMobile })
      });

      const data = await response.json();

      if (data.success) {
        setLoggedInCandidate(data.candidate);
        localStorage.setItem('kevalon_candidate', JSON.stringify(data.candidate));
      } else {
        setCandidateAuthError(data.message || 'Invalid credentials. Mobile and Email must match registered record.');
      }
    } catch (err) {
      setCandidateAuthError('Network error. Please try logging in again.');
    } finally {
      setCandidateAuthLoading(false);
    }
  };

  const handleCandidateLogout = () => {
    setLoggedInCandidate(null);
    localStorage.removeItem('kevalon_candidate');
  };

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
      const fullUrl = getApiUrl(`/api/candidates/public-status?query=${encodeURIComponent(searchQuery.trim())}`);
      const response = await fetch(fullUrl);
      const data = await response.json();

      if (data.success) {
        setCandidateResult(data.candidate);
        setPracticalTasks(data.practicalTasks || []);
      } else {
        setSearchError(data.message || 'No candidate record found matching your query.');
      }
    } catch (err) {
      setSearchError('Network connection issue. Please try searching again.');
    } finally {
      setSearching(false);
    }
  };

  const setFastCredentials = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
  };

  // IF CANDIDATE IS LOGGED IN, RENDER THE FULL CANDIDATE PORTAL
  if (loggedInCandidate) {
    return <CandidatePortal candidate={loggedInCandidate} onLogout={handleCandidateLogout} />;
  }

  // IF ACTIVE TAB IS CAREERS, RENDER THE CORPORATE CAREERS PAGE
  if (activeTab === 'careers') {
    return (
      <CareersPage 
        onNavigateCandidateLogin={() => setActiveTab('candidate_login')} 
        onNavigateEmployeeLogin={() => setActiveTab('employee')} 
      />
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black flex flex-col justify-between items-center p-4 sm:p-6 select-none font-sans"
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top Navbar Header */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 px-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl mb-4 text-white">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Kevalon Technology Logo" className="h-9 w-auto object-contain drop-shadow-md" />
          <div className="hidden sm:block border-l border-white/20 pl-3">
            <h1 className="text-sm font-extrabold tracking-wider uppercase text-white">Kevalon Technology</h1>
            <p className="text-[10px] text-blue-300 font-medium tracking-wide">Enterprise Recruitment CRM & Careers Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('careers')}
            className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition flex items-center gap-1.5"
          >
            <Briefcase size={13} className="text-yellow-400" /> Careers Portal
          </button>
          
          <button
            onClick={() => setActiveTab(activeTab === 'employee' ? 'candidate_login' : 'employee')}
            className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition flex items-center gap-1.5"
          >
            {activeTab === 'employee' ? (
              <>
                <Ticket size={13} className="text-emerald-400" /> Candidate Sign In
              </>
            ) : (
              <>
                <Lock size={13} className="text-blue-400" /> Employee Login
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Glassmorphic Card Container */}
      <main className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden my-auto">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-[#034665] via-[#055b85] to-[#034665] text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Building2 size={200} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner mb-3">
              <img src={logoImg} alt="Kevalon Logo" className="h-12 sm:h-14 w-auto object-contain drop-shadow" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              Kevalon Technology
            </h2>
            <p className="text-xs text-blue-100 uppercase tracking-widest font-semibold mt-1 flex items-center gap-1">
              <Sparkles size={13} className="text-yellow-400" /> Enterprise ATS & Candidate Portal
            </p>
          </div>
        </div>

        {/* Tab Selector Segmented Bar */}
        <div className="p-2 bg-slate-100 border-b border-gray-200 grid grid-cols-4 gap-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('careers')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1 transition-all duration-200 ${
              activeTab === 'careers'
                ? 'bg-[#034665] text-white shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Briefcase size={14} className={activeTab === 'careers' ? 'text-yellow-400' : ''} />
            <span>Careers</span>
          </button>

          <button
            onClick={() => setActiveTab('candidate_login')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1 transition-all duration-200 ${
              activeTab === 'candidate_login'
                ? 'bg-[#034665] text-white shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <User size={14} className={activeTab === 'candidate_login' ? 'text-yellow-400' : ''} />
            <span>Candidate Login</span>
          </button>

          <button
            onClick={() => setActiveTab('candidate_track')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1 transition-all duration-200 ${
              activeTab === 'candidate_track'
                ? 'bg-[#034665] text-white shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Ticket size={14} className={activeTab === 'candidate_track' ? 'text-emerald-400' : ''} />
            <span>Quick Track</span>
          </button>

          <button
            onClick={() => setActiveTab('employee')}
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1 transition-all duration-200 ${
              activeTab === 'employee'
                ? 'bg-[#034665] text-white shadow-md font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Lock size={14} className={activeTab === 'employee' ? 'text-blue-400' : ''} />
            <span>Employee Login</span>
          </button>
        </div>

        {/* TAB: CANDIDATE SIGN IN (BOTH MOBILE AND EMAIL REQUIRED) */}
        {activeTab === 'candidate_login' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-blue-50 text-blue-900 text-[11px] font-extrabold uppercase tracking-wider rounded-full inline-flex items-center gap-1 border border-blue-200 mb-1">
                <User size={12} className="text-[#034665]" /> Candidate Self-Service Login
              </span>
              <h3 className="text-lg font-black text-slate-900">Sign In to Candidate Dashboard</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Both registered Mobile Number AND Email Address are strictly required to access your ATS profile.
              </p>
            </div>

            <form onSubmit={handleCandidateLogin} className="space-y-4">
              {candidateAuthError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center shadow-xs">
                  {candidateAuthError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Phone size={14} className="text-[#034665]" /> Registered Contact / Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={candidateMobile}
                  onChange={(e) => setCandidateMobile(e.target.value)}
                  placeholder="e.g. 8200925369"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#034665] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Mail size={14} className="text-[#034665]" /> Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="e.g. vanshpatel1496@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#034665] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={candidateAuthLoading}
                className="w-full py-3 bg-[#034665] hover:bg-[#023249] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck size={16} />
                {candidateAuthLoading ? 'Authenticating Candidate...' : 'Sign In to Candidate ATS Dashboard'}
              </button>
            </form>
          </div>
        )}

        {/* TAB: QUICK TRACKER SEARCH (NO LOGIN REQUIRED) */}
        {activeTab === 'candidate_track' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wider rounded-full inline-flex items-center gap-1 border border-emerald-200 mb-1">
                <Ticket size={12} className="text-emerald-700" /> Real-Time Quick Tracker
              </span>
              <h3 className="text-lg font-black text-slate-900">Check Your Interview Stage Live</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Enter your Candidate Code (e.g. CAND-1001), Token Number, Mobile Number, or Enrollment No.
              </p>
            </div>

            {/* Candidate Search Form */}
            <form onSubmit={handleCandidateSearch} className="space-y-3">
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Candidate Code (e.g. CAND-1073) or Mobile No..."
                  className="w-full pl-11 pr-32 py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#034665] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all shadow-inner"
                />
                <Search className="absolute left-3.5 text-[#034665]" size={18} />
                
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-1.5 py-2 px-4 bg-[#034665] hover:bg-[#023249] text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {searching ? 'Searching...' : (
                    <>
                      Track <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center shadow-xs">
                {searchError}
              </div>
            )}

            {/* Candidate Result Dossier */}
            {candidateResult && (
              <div className="space-y-4 animate-fadeIn">
                {/* Dossier Card Header */}
                <div className="p-4 bg-gradient-to-r from-slate-900 via-[#034665] to-slate-900 text-white rounded-xl shadow-lg border border-slate-700 space-y-3">
                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] text-blue-300 font-mono font-bold tracking-wider uppercase block">
                        Candidate Code: {candidateResult.candidateCode}
                      </span>
                      <h4 className="font-black text-lg text-white tracking-wide">{candidateResult.fullName}</h4>
                    </div>
                    <StageBadge stage={candidateResult.stage} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                      <span className="text-[10px] text-slate-400 font-medium block">Token Number</span>
                      <strong className="text-yellow-400 font-mono text-sm">{candidateResult.tokenNumber}</strong>
                    </div>

                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                      <span className="text-[10px] text-slate-400 font-medium block">Applied Profile</span>
                      <strong className="text-white text-xs truncate block">{candidateResult.appliedProfileName}</strong>
                    </div>

                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                      <span className="text-[10px] text-slate-400 font-medium block">College Name</span>
                      <strong className="text-white text-xs truncate block">{candidateResult.collegeName}</strong>
                    </div>

                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-xs">
                      <span className="text-[10px] text-slate-400 font-medium block">Branch</span>
                      <strong className="text-white text-xs truncate block">{candidateResult.branch}</strong>
                    </div>
                  </div>

                  {/* Assigned Interviewer Banner */}
                  <div className="bg-emerald-950/70 border border-emerald-500/40 p-2.5 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-emerald-400" />
                      <div>
                        <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block">Assigned Interview Panel / Evaluator:</span>
                        <strong className="text-yellow-300 text-xs font-black">{candidateResult.assignedInterviewerName || 'Pending Auto-Assignment'}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                      Live Queue
                    </span>
                  </div>
                </div>

                {/* PRACTICAL TASKS SECTION */}
                {(candidateResult.stage.includes('PRACTICAL') || candidateResult.stage === 'TECHNICAL_COMPLETED') ? (
                  <div 
                    className="p-4 border-2 border-purple-300 bg-purple-50/60 rounded-xl space-y-3 shadow-md select-none"
                    onCopy={(e) => { e.preventDefault(); alert("Copying is disabled."); }}
                    onCut={(e) => { e.preventDefault(); alert("Copying is disabled."); }}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                      <h4 className="font-extrabold text-xs text-purple-950 uppercase tracking-wide flex items-center gap-1.5">
                        <FileCode size={16} className="text-purple-700" /> Assigned Practical Coding Tasks
                      </h4>
                      <span className="text-[10px] bg-purple-900 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldAlert size={12} className="text-yellow-400" /> Protected (Anti-Copy On)
                      </span>
                    </div>

                    {practicalTasks.length === 0 ? (
                      <div className="p-4 text-center text-xs text-purple-800 font-semibold bg-white rounded-lg border border-purple-200">
                        Task details loading...
                      </div>
                    ) : (
                      practicalTasks.map((task, idx) => (
                        <div 
                          key={idx} 
                          className="p-3.5 bg-white border border-purple-200 rounded-lg space-y-2 shadow-xs select-none"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-purple-950 text-xs sm:text-sm">Task #{idx + 1}: {task.taskTitle}</span>
                            <span className="text-[10px] bg-purple-100 text-purple-900 font-extrabold px-2 py-0.5 rounded-md border border-purple-300">
                              Max Marks: {task.maxMarks} ({task.expectedTimeMinutes} mins)
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 font-mono bg-purple-50/70 p-3 border border-purple-100 rounded-lg leading-relaxed select-none">
                            {task.taskDescription}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs text-slate-700 font-medium">
                    Current Stage: <strong className="text-[#034665]">{candidateResult.stage}</strong>. Practical coding tasks will appear here once you enter the Practical Round.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: EMPLOYEE PORTAL LOGIN */}
        {activeTab === 'employee' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 text-[11px] font-extrabold uppercase tracking-wider rounded-full inline-flex items-center gap-1 border border-slate-200 mb-1">
                <Lock size={12} className="text-[#034665]" /> Authorized Personnel
              </span>
              <h3 className="text-lg font-black text-slate-900">Interviewer & Admin Sign In</h3>
              <p className="text-xs text-slate-500">Sign in to access workstation queues, evaluation forms, and panel controls.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <User size={14} className="text-[#034665]" /> Username or Work Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#034665] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Lock size={14} className="text-[#034665]" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#034665] focus:bg-white rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#034665] hover:bg-[#023249] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound size={16} />
                {loading ? 'Authenticating Credentials...' : 'Sign In to Workstation Portal'}
              </button>
            </form>

            {/* Quick Preset Selector */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                Quick Sign-In Credentials Presets:
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-[11px]">
                <button
                  onClick={() => setFastCredentials('admin', 'Admin@123')}
                  className="px-3 py-1 bg-[#034665] text-white rounded-lg font-bold hover:opacity-90 transition shadow-2xs"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => setFastCredentials('vikram.tech', 'Tech@123')}
                  className="px-3 py-1 bg-blue-700 text-white rounded-lg font-bold hover:opacity-90 transition shadow-2xs"
                >
                  Technical Interviewer
                </button>
                <button
                  onClick={() => setFastCredentials('pooja.reception', 'Pooja@123')}
                  className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-bold hover:opacity-90 transition shadow-2xs"
                >
                  Receptionist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Security Badge Banner */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center flex items-center justify-center gap-2 text-[11px] text-slate-600 font-semibold">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>256-Bit SSL Encrypted Enterprise Portal &bull; Kevalon Technology</span>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-4 text-center text-xs text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} Kevalon Technology Enterprise Systems. All rights reserved.
      </footer>
    </div>
  );
};
