import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, GraduationCap, Building2, Ticket, CheckCircle2, 
  FileCode, ShieldAlert, LogOut, Sparkles, MapPin, Globe, Cpu, Award, ArrowRight, UserCheck,
  RefreshCw, Check, Code, Layers, Server, ShieldCheck, HeartHandshake, PhoneCall
} from 'lucide-react';
import logoImg from '../Kevalon_Technology_Logo_Transparent.png';
import { StageBadge } from '../components/common/Badge';
import { getApiUrl } from '../config/api';

export const CandidatePortal = ({ candidate: initialCandidate, onLogout }) => {
  const [candidate, setCandidate] = useState(initialCandidate);
  const [activeTab, setActiveTab] = useState('profile');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  // REAL-TIME AUTO REFRESH POLLING (SYNC LIVE CANDIDATE STAGE & INTERVIEWER)
  const refreshLiveCandidateData = async () => {
    if (!candidate?.candidateCode && !candidate?.mobile) return;
    setIsRefreshing(true);

    try {
      const q = candidate.candidateCode || candidate.mobile;
      const fullUrl = getApiUrl(`/api/candidates/public-status?query=${encodeURIComponent(q)}`);
      const res = await fetch(fullUrl);
      const data = await res.json();

      if (data.success && data.candidate) {
        setCandidate(prev => ({
          ...prev,
          ...data.candidate,
          assignedPracticalTasks: data.practicalTasks && data.practicalTasks.length > 0 
            ? data.practicalTasks 
            : prev.assignedPracticalTasks
        }));
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.error("Live candidate refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshLiveCandidateData();
    const interval = setInterval(refreshLiveCandidateData, 5000); // Live poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Anti-Copy & Right-Click Protection on Candidate Portal
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

  // Compute Recruitment Pipeline Stepper Progress
  const stagesOrder = [
    { key: 'REGISTERED', label: 'Registered' },
    { key: 'RECEPTION_WAITING', label: 'Checked-In' },
    { key: 'TECHNICAL', label: 'Technical' },
    { key: 'PRACTICAL', label: 'Practical' },
    { key: 'HR', label: 'HR Final' },
    { key: 'SELECTED', label: 'Selected' }
  ];

  const getStageIndex = (stageStr) => {
    if (!stageStr) return 0;
    if (stageStr === 'REGISTERED') return 0;
    if (stageStr === 'RECEPTION_WAITING') return 1;
    if (stageStr.includes('TECHNICAL')) return 2;
    if (stageStr.includes('PRACTICAL')) return 3;
    if (stageStr.includes('HR')) return 4;
    if (stageStr === 'SELECTED') return 5;
    return 1;
  };

  const currentStageIdx = getStageIndex(candidate.stage);

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between p-3 sm:p-6 select-none" onContextMenu={e => e.preventDefault()}>
      
      {/* Top Premium Header Navbar */}
      <header className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 rounded-2xl shadow-2xl mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#034665] to-slate-900 rounded-xl border border-white/20 shadow-md">
            <img src={logoImg} alt="Kevalon Technology Logo" className="h-9 w-auto object-contain drop-shadow" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white flex items-center gap-2">
              Kevalon Technology <Sparkles size={14} className="text-yellow-400" />
            </h1>
            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">
              Candidate Self-Service & Real-Time Live Portal
            </p>
          </div>
        </div>

        {/* Real-time Refresh Badge & Exit Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-[11px] font-bold text-emerald-300">
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isRefreshing ? 'animate-ping' : ''}`}></span>
            <span>Live Sync Active</span>
            <RefreshCw size={12} className={`text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>

          <div className="hidden md:block text-right">
            <div className="text-xs font-black text-white">{candidate.fullName}</div>
            <div className="text-[10px] text-yellow-300 font-mono font-bold">{candidate.candidateCode}</div>
          </div>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md border border-rose-500/40"
          >
            <LogOut size={14} /> Exit Portal
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="w-full max-w-6xl mx-auto space-y-6 my-auto">
        
        {/* LIVE INTERVIEW NOTIFICATION & WORKSTATION ROUTING BANNER */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-[#034665] to-slate-900 border-2 border-blue-400/50 rounded-2xl shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] bg-emerald-950/90 text-emerald-300 font-black uppercase tracking-widest px-3 py-0.5 rounded-full border border-emerald-500/50">
                  Real-Time Live Interview Call
                </span>
                <span className="text-[10px] text-slate-300 font-mono">Synced: {lastRefreshedAt.toLocaleTimeString()}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-400 animate-spin" />
                {candidate.stage.includes('TECHNICAL') ? 'Technical Interview Call Alert!' :
                 candidate.stage.includes('PRACTICAL') ? 'Practical Coding Evaluation In Progress!' :
                 candidate.stage.includes('HR') ? 'HR Final Interview Call Alert!' :
                 candidate.stage === 'SELECTED' ? '🎉 Congratulations! You Are Selected!' :
                 'Reception Lounge Waiting State'}
              </h2>

              <p className="text-xs text-blue-100 font-medium leading-relaxed">
                {candidate.stage.includes('TECHNICAL') ? (
                  <>You have been called for <strong>Technical Round</strong>. Please report to your assigned interviewer station immediately.</>
                ) : candidate.stage.includes('PRACTICAL') ? (
                  <>You are in the <strong>Practical Round</strong>. Please view your assigned coding problem statements below.</>
                ) : candidate.stage.includes('HR') ? (
                  <>You have cleared technical & practical rounds! Please proceed to the <strong>HR Panel</strong> for final evaluation.</>
                ) : candidate.stage === 'SELECTED' ? (
                  <>Congratulations! You have successfully cleared all interview rounds and been selected at Kevalon Technology.</>
                ) : (
                  <>Token generated! Please relax in the reception lounge. Your station call will update automatically in real-time.</>
                )}
              </p>
            </div>

            {/* Station Guidance & Assigned Interviewer Card */}
            <div className="w-full lg:w-auto bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border border-blue-400/40 space-y-2 min-w-[270px] shadow-lg">
              <div className="text-[10px] text-blue-300 font-black uppercase tracking-wider flex items-center justify-between">
                <span>Assigned Station / Panel:</span>
                <span className="text-yellow-400 font-mono">TK: {candidate.tokenNumber || 'N/A'}</span>
              </div>
              
              <div className="text-base font-black text-yellow-300 flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-400" />
                {candidate.assignedInterviewerName || 'Pending Auto-Assignment'}
              </div>

              <div className="text-[11px] text-slate-300 flex items-center justify-between border-t border-white/10 pt-1.5">
                <span>Applied Profile:</span>
                <strong className="text-white font-bold">{candidate.appliedProfileName}</strong>
              </div>
            </div>
          </div>

          {/* PIPELINE PROGRESS STEPPER BAR */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
              <span>Recruitment Pipeline Stage Progress:</span>
              <span className="text-emerald-400 font-mono font-extrabold">{candidate.stage}</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {stagesOrder.map((stg, idx) => {
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div 
                    key={stg.key}
                    className={`p-2 rounded-lg text-center transition-all border ${
                      isCurrent
                        ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-black shadow-lg scale-102'
                        : isPassed
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-white/5 text-slate-500 border-white/10 font-medium'
                    }`}
                  >
                    <div className="text-[10px] uppercase truncate">{stg.label}</div>
                    {isPassed && <CheckCircle2 size={12} className="mx-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Selection Segmented Controller */}
        <div className="flex border-b border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-1.5 text-xs font-bold shadow-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-[#034665] text-white shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={16} className={activeTab === 'profile' ? 'text-yellow-400' : ''} />
            <span>Candidate Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'tasks'
                ? 'bg-[#034665] text-white shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode size={16} className={activeTab === 'tasks' ? 'text-purple-400' : ''} />
            <span>Assigned Practical Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'company'
                ? 'bg-[#034665] text-white shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 size={16} className={activeTab === 'company' ? 'text-emerald-400' : ''} />
            <span>About Kevalon Technology</span>
          </button>
        </div>

        {/* TAB 1: CANDIDATE PROFILE DOSSIER */}
        {activeTab === 'profile' && (
          <div className="bg-white/95 backdrop-blur-2xl text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Candidate Personal & Campus Dossier</h3>
                <p className="text-xs text-slate-500 font-medium">Verified registration records for Kevalon Campus Placement Drive.</p>
              </div>
              <StageBadge stage={candidate.stage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Personal Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-[#034665] uppercase border-b pb-1.5 flex items-center gap-1.5">
                  <User size={15} /> Registered Contact Profile
                </h4>
                <div className="flex justify-between"><span>Full Name:</span> <strong className="text-slate-900 text-sm font-black">{candidate.fullName}</strong></div>
                <div className="flex justify-between"><span>Candidate Code:</span> <strong className="text-[#034665] font-mono font-bold">{candidate.candidateCode}</strong></div>
                <div className="flex justify-between"><span>Email Address:</span> <strong className="text-slate-800 font-semibold">{candidate.email}</strong></div>
                <div className="flex justify-between"><span>Mobile Number:</span> <strong className="text-slate-800 font-mono font-bold">{candidate.mobile}</strong></div>
                <div className="flex justify-between"><span>Token Number:</span> <strong className="text-emerald-700 font-mono font-black">{candidate.tokenNumber}</strong></div>
              </div>

              {/* Campus Academic Performance */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-[#034665] uppercase border-b pb-1.5 flex items-center gap-1.5">
                  <GraduationCap size={15} /> Campus Academic Record
                </h4>
                <div className="flex justify-between"><span>College Name:</span> <strong className="text-slate-900 font-bold">{candidate.collegeName}</strong></div>
                <div className="flex justify-between"><span>Branch / Stream:</span> <strong className="text-slate-800">{candidate.branch}</strong></div>
                <div className="flex justify-between"><span>Enrollment No:</span> <strong className="text-indigo-900 font-mono font-bold">{candidate.enrollmentNo}</strong></div>
                <div className="flex justify-between"><span>Semester:</span> <strong className="text-slate-800">{candidate.semester}</strong></div>
                <div className="flex justify-between"><span>Current CPI / SPI:</span> <strong className="text-emerald-800 font-black text-sm">{candidate.currentCpiSpi}</strong></div>
              </div>
            </div>

            {/* Academic Score Cards Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-[10px] text-blue-800 font-bold uppercase block mb-0.5">10th Percentage</span>
                <strong className="text-blue-950 text-lg font-black">{candidate.tenthPercentage}%</strong>
              </div>
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-[10px] text-indigo-800 font-bold uppercase block mb-0.5">12th Percentage</span>
                <strong className="text-indigo-950 text-lg font-black">{candidate.twelfthPercentage}%</strong>
              </div>
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-[10px] text-purple-800 font-bold uppercase block mb-0.5">Diploma Percentage</span>
                <strong className="text-purple-950 text-lg font-black">{candidate.diplomaPercentage}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED PRACTICAL TASKS */}
        {activeTab === 'tasks' && (
          <div className="bg-white/95 backdrop-blur-2xl text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FileCode size={20} className="text-purple-800" /> Assigned Practical Coding Tasks
                </h3>
                <p className="text-xs text-slate-500 font-medium">Read problem statements carefully. Text selection and copying are disabled.</p>
              </div>

              <span className="text-[11px] bg-purple-900 text-white font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <ShieldAlert size={13} className="text-yellow-400" /> Anti-Copy Protected
              </span>
            </div>

            {candidate.assignedPracticalTasks && candidate.assignedPracticalTasks.length > 0 ? (
              <div className="space-y-4">
                {candidate.assignedPracticalTasks.map((t, idx) => (
                  <div key={idx} className="p-4 border-2 border-purple-200 bg-purple-50/40 rounded-xl space-y-2 shadow-xs select-none">
                    <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                      <h4 className="font-black text-purple-950 text-sm">Task #{idx + 1}: {t.taskTitle}</h4>
                      <span className="text-xs bg-purple-200 text-purple-950 font-bold px-2.5 py-0.5 rounded-md">
                        Max Marks: {t.maxMarks} ({t.expectedTimeMinutes} mins)
                      </span>
                    </div>

                    <p className="text-xs text-slate-900 font-mono bg-white p-3 border border-purple-200 rounded-lg leading-relaxed select-none">
                      {t.taskDescription}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border">
                No practical tasks assigned yet. Your tasks will be displayed here once you reach the Practical Round.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ABOUT KEVALON TECHNOLOGY (FETCHED DIRECTLY FROM KEVALONTECHNOLOGY.IN) */}
        {activeTab === 'company' && (
          <div className="bg-white/95 backdrop-blur-2xl text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#034665] rounded-xl shadow-md">
                  <img src={logoImg} alt="Kevalon Logo" className="h-10 w-auto object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Kevalon Technology</h3>
                  <p className="text-xs text-[#034665] font-extrabold uppercase tracking-wider">
                    Official IT Services & Digital Transformation Partner
                  </p>
                </div>
              </div>

              <a 
                href="https://kevalontechnology.in" 
                target="_blank" 
                rel="noreferrer" 
                className="px-3.5 py-1.5 bg-blue-50 border border-blue-300 text-blue-900 hover:bg-blue-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Globe size={14} className="text-[#034665]" /> www.kevalontechnology.in
              </a>
            </div>

            {/* Company Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[#034665]">
                <Award size={16} /> Company Overview
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Headquartered in Ahmedabad, India, <strong>Kevalon Technology</strong> is an enterprise software development & IT services company founded in 2020. We deliver custom web applications, mobile solutions, AI/ML integrations, custom ERP/CRM platforms, and cloud infrastructure to clients across 10+ countries worldwide.
              </p>
            </div>

            {/* Core Services Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[#034665]">
                <Layers size={16} /> Core Technical Expertise & Services
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:border-blue-300 transition">
                  <Code size={20} className="text-[#034665]" />
                  <h5 className="font-bold text-slate-900 text-xs">Web & Mobile Development</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Enterprise web apps using React, Next.js, Node.js (MERN) and mobile apps on Flutter & React Native.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:border-blue-300 transition">
                  <Cpu size={20} className="text-[#034665]" />
                  <h5 className="font-bold text-slate-900 text-xs">AI & Machine Learning</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Generative AI, AI agent development, LLM integration, and predictive analytics automation.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:border-blue-300 transition">
                  <Server size={20} className="text-[#034665]" />
                  <h5 className="font-bold text-slate-900 text-xs">Cloud Solutions & DevOps</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Cloud migration, Docker, Kubernetes, Terraform, AWS, Azure, and Google Cloud security.
                  </p>
                </div>
              </div>
            </div>

            {/* Corporate Address & Contact Details */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-[#034665] flex items-center gap-1 uppercase">
                  <MapPin size={14} /> Corporate Headquarters Address:
                </h5>
                <p className="text-slate-800 font-medium leading-relaxed">
                  913, Solaris Business Hub, Parshwanath Jain BRTS, Bhuyangdev, Ahmedabad, Gujarat, India - 380061
                </p>
              </div>

              <div className="space-y-1 md:border-l md:pl-4 border-blue-200">
                <h5 className="font-bold text-[#034665] flex items-center gap-1 uppercase">
                  <PhoneCall size={14} /> Contact & HR Inquiry:
                </h5>
                <p className="text-slate-800 font-mono font-bold">Phone: +91 9081012218</p>
                <p className="text-slate-800 font-medium">HR Email: <a href="mailto:hr@kevalontechnology.in" className="text-blue-700 underline font-bold">hr@kevalontechnology.in</a></p>
                <p className="text-slate-800 font-medium">Sales Email: <a href="mailto:sales@kevalontechnology.in" className="text-blue-700 underline">sales@kevalontechnology.in</a></p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-6xl mx-auto mt-6 text-center text-xs text-slate-400 font-medium flex items-center justify-between">
        <span>&copy; {new Date().getFullYear()} Kevalon Technology Enterprise Systems. All rights reserved.</span>
        <span className="font-mono text-[10px] text-slate-500">Official Portal: kevalontechnology.in</span>
      </footer>
    </div>
  );
};
