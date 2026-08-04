import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Bookmark, Calendar, FolderCheck, User, Bell, Settings, LogOut,
  Sparkles, CheckCircle2, Clock, MapPin, Globe, ExternalLink, RefreshCw, Upload, Trash2,
  FileCode, ShieldAlert, AlertTriangle, Phone, Mail, Award, Check, X, Eye, Download, Video, ShieldCheck
} from 'lucide-react';
import { Button, Badge, ConfirmationModal, EmptyState } from '../components/common/CorporateUI';
import { Modal } from '../components/common/Modal';
import { StageBadge } from '../components/common/Badge';
import { getApiUrl } from '../config/api';

export const CandidatePortal = ({ candidate: initialCandidate, onLogout }) => {
  const [candidate, setCandidate] = useState(initialCandidate);
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  // Delete Account Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile Edit Form State
  const [profileData, setProfileData] = useState({
    fullName: initialCandidate?.fullName || '',
    email: initialCandidate?.email || '',
    mobile: initialCandidate?.mobile || '',
    collegeName: initialCandidate?.collegeName || '',
    branch: initialCandidate?.branch || '',
    semester: initialCandidate?.semester || '',
    tenthPercentage: initialCandidate?.tenthPercentage || '',
    twelfthPercentage: initialCandidate?.twelfthPercentage || '',
    diplomaPercentage: initialCandidate?.diplomaPercentage || '',
    currentCpiSpi: initialCandidate?.currentCpiSpi || '',
    skills: initialCandidate?.skills || 'React.js, Node.js, JavaScript, Tailwind CSS',
    portfolioUrl: 'https://harsh-portfolio.dev',
    linkedinUrl: 'https://linkedin.com/in/harsh-patel',
    githubUrl: 'https://github.com/harsh-patel'
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Settings State
  const [settingsData, setSettingsData] = useState({
    emailNotif: true,
    smsNotif: true,
    interviewReminders: true
  });

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
    const interval = setInterval(refreshLiveCandidateData, 6000);
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

  const handleProfileSave = (e) => {
    e.preventDefault();
    setCandidate(prev => ({ ...prev, ...profileData }));
    setProfileSavedMsg('Candidate Profile information updated successfully!');
    setTimeout(() => setProfileSavedMsg(''), 3000);
  };

  // Stage Stepper Mapping
  const trackerStages = [
    { key: 'Applied', label: 'Applied' },
    { key: 'Screening', label: 'HR Screening' },
    { key: 'Technical Round', label: 'Technical Round' },
    { key: 'HR Round', label: 'HR Round' },
    { key: 'Selected', label: 'Selected' },
    { key: 'Offer Sent', label: 'Offer Sent' }
  ];

  const getCurrentTrackerStageIndex = () => {
    const stg = candidate.stage || '';
    if (stg === 'REGISTERED') return 0;
    if (stg === 'RECEPTION_WAITING') return 1;
    if (stg.includes('TECHNICAL')) return 2;
    if (stg.includes('PRACTICAL')) return 3;
    if (stg.includes('HR')) return 3;
    if (stg === 'SELECTED') return 4;
    return 1;
  };

  const currentTrackerIdx = getCurrentTrackerStageIndex();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none" onContextMenu={e => e.preventDefault()}>
      
      {/* TOP ATS HEADER BAR */}
      <header className="bg-[#034665] text-white h-16 flex items-center justify-between px-4 sm:px-6 shadow-md z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Kevalon Logo" className="h-9 w-auto object-contain drop-shadow" />
          <div className="border-l border-white/20 pl-3">
            <h1 className="font-extrabold text-sm tracking-wider uppercase text-white leading-tight">
              Kevalon Technology ATS
            </h1>
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-widest">
              Candidate Self-Service Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Sync Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-[11px] font-bold text-emerald-300">
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isRefreshing ? 'animate-ping' : ''}`}></span>
            <span>Live Sync</span>
            <RefreshCw size={12} className={`text-emerald-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>

          <div className="text-right text-xs hidden md:block">
            <div className="font-black text-white">{candidate.fullName}</div>
            <div className="text-[10px] text-yellow-300 font-mono font-bold">{candidate.candidateCode}</div>
          </div>

          <Button variant="danger" size="sm" onClick={onLogout} icon={LogOut}>
            Logout
          </Button>
        </div>
      </header>

      {/* MAIN ATS LAYOUT: SIDEBAR + CONTENT */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-3 sm:p-6 gap-6">
        
        {/* ATS SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            
            {/* Candidate Summary Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-[#034665] text-white rounded-xl font-bold flex items-center justify-center text-sm shadow-xs">
                {candidate.fullName ? candidate.fullName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-black text-slate-900 text-xs truncate">{candidate.fullName}</h4>
                <div className="text-[10px] text-[#034665] font-mono font-bold truncate">{candidate.candidateCode}</div>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="space-y-1 text-xs font-semibold">
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'applications', label: 'My Applications', icon: FileText },
                { id: 'saved_jobs', label: 'Saved Openings', icon: Bookmark },
                { id: 'interviews', label: 'Interviews & Schedules', icon: Calendar },
                { id: 'documents', label: 'Documents Vault', icon: FolderCheck },
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
                { id: 'settings', label: 'Account Settings', icon: Settings }
              ].map(item => {
                const ItemIcon = item.icon;
                const isActive = sidebarTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSidebarTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                      isActive
                        ? 'bg-[#034665] text-white font-extrabold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ItemIcon size={16} className={isActive ? 'text-yellow-400' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#034665]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" /> Enterprise ATS Active
            </div>
            <div>Refreshed: {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </aside>

        {/* ATS DASHBOARD MAIN CONTENT BODY */}
        <main className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {sidebarTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Greeting Card */}
              <div className="p-6 bg-gradient-to-r from-[#034665] via-[#055b85] to-slate-900 text-white rounded-2xl shadow-md space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] text-blue-200 font-bold uppercase tracking-wider block">
                      Applicant Tracking System
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Welcome back, {candidate.fullName || 'Harsh'} 👋
                    </h2>
                  </div>
                  <StageBadge stage={candidate.stage} />
                </div>

                <p className="text-xs text-blue-100 font-medium">
                  Track your job application status, interview schedules, assigned practical tasks, and HR feedback in real-time.
                </p>
              </div>

              {/* Application Statistics Grid (5 Key Metric Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Applied Jobs</div>
                  <div className="text-2xl font-black text-slate-900">1</div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-1">
                  <div className="text-[10px] text-blue-800 font-bold uppercase">Interviews</div>
                  <div className="text-2xl font-black text-blue-900">
                    {candidate.stage.includes('TECHNICAL') || candidate.stage.includes('HR') ? '1' : '0'}
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                  <div className="text-[10px] text-emerald-800 font-bold uppercase">Offers Released</div>
                  <div className="text-2xl font-black text-emerald-900">
                    {candidate.stage === 'SELECTED' ? '1' : '0'}
                  </div>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1">
                  <div className="text-[10px] text-rose-800 font-bold uppercase">Rejected</div>
                  <div className="text-2xl font-black text-rose-900">
                    {candidate.stage === 'REJECTED' ? '1' : '0'}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1">
                  <div className="text-[10px] text-amber-800 font-bold uppercase">Saved Jobs</div>
                  <div className="text-2xl font-black text-amber-900">2</div>
                </div>
              </div>

              {/* LIVE STAGE NOTIFICATION BANNER */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-[#034665] text-white rounded-2xl shadow-md border-2 border-blue-400/40 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                        Live Round Status
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-400" />
                      Current Recruitment Stage: {candidate.stage}
                    </h3>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs text-right">
                    <div className="text-[10px] text-slate-300 font-bold uppercase">Assigned Interviewer:</div>
                    <strong className="text-yellow-300 font-bold">{candidate.assignedInterviewerName || 'Pending Auto-Assignment'}</strong>
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY TIMELINE */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Clock size={16} className="text-[#034665]" /> Recent Recruitment Activity Log
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Application Stage Update</div>
                      <div className="text-slate-500">Candidate reached stage: {candidate.stage}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Today</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Interviewer Auto-Assignment</div>
                      <div className="text-slate-500">Assigned Panel: {candidate.assignedInterviewerName}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Today</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Reception Check-In Token Generated</div>
                      <div className="text-slate-500">Token Number: {candidate.tokenNumber}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Today</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY APPLICATIONS & APPLICATION TRACKER */}
          {sidebarTab === 'applications' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">My Job Applications</h3>
                <p className="text-xs text-slate-500">Track application progress and view job descriptions.</p>
              </div>

              {/* APPLICATION TRACKER PROGRESS TIMELINE */}
              <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">Live Application Progress</span>
                    <h4 className="font-bold text-base text-white">{candidate.appliedProfileName || 'Full Stack Engineering Role'}</h4>
                  </div>
                  <StageBadge stage={candidate.stage} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                  {trackerStages.map((stg, idx) => {
                    const isPassed = idx <= currentTrackerIdx;
                    const isCurrent = idx === currentTrackerIdx;
                    return (
                      <div 
                        key={stg.key}
                        className={`p-2.5 rounded-xl text-center border transition-all ${
                          isCurrent
                            ? 'bg-yellow-400 text-slate-950 font-black border-yellow-300 shadow-md'
                            : isPassed
                            ? 'bg-emerald-950 text-emerald-300 font-bold border-emerald-500/40'
                            : 'bg-white/5 text-slate-500 border-white/10'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold">{stg.label}</div>
                        {isPassed && <Check size={14} className="mx-auto mt-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ASSIGNED PRACTICAL CODING TASKS VIEW */}
              <div className="p-5 border-2 border-purple-200 bg-purple-50/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                  <h4 className="font-black text-purple-950 text-sm flex items-center gap-2">
                    <FileCode size={18} className="text-purple-800" /> Assigned Practical Tasks
                  </h4>
                  <span className="text-[10px] bg-purple-900 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldAlert size={12} className="text-yellow-400" /> Protected (Anti-Copy On)
                  </span>
                </div>

                {candidate.assignedPracticalTasks && candidate.assignedPracticalTasks.length > 0 ? (
                  <div className="space-y-3">
                    {candidate.assignedPracticalTasks.map((t, idx) => (
                      <div key={idx} className="p-4 bg-white border border-purple-200 rounded-xl space-y-2 shadow-2xs select-none">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-950 text-xs">Task #{idx + 1}: {t.taskTitle}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded">
                            Max Marks: {t.maxMarks} ({t.expectedTimeMinutes} mins)
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 font-mono bg-purple-50 p-3 rounded border border-purple-100 leading-relaxed">
                          {t.taskDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border">
                    No practical tasks assigned yet. Your tasks will be displayed here once you reach the Practical Round.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED JOBS */}
          {sidebarTab === 'saved_jobs' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Saved / Bookmarked Positions</h3>
                <p className="text-xs text-slate-500">Bookmarked openings saved for quick application.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="primary">Engineering</Badge>
                      <h4 className="font-black text-slate-900 text-sm mt-1">Senior MERN Stack Developer</h4>
                    </div>
                    <button className="text-amber-600"><Bookmark size={16} fill="currentColor" /></button>
                  </div>
                  <div className="text-slate-600">Location: Ahmedabad (On-Site) | Salary: ₹6.0L - ₹11.0L PA</div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="primary" size="sm">Quick Apply</Button>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="success">AI & Data</Badge>
                      <h4 className="font-black text-slate-900 text-sm mt-1">AI & Machine Learning Engineer</h4>
                    </div>
                    <button className="text-amber-600"><Bookmark size={16} fill="currentColor" /></button>
                  </div>
                  <div className="text-slate-600">Location: Ahmedabad (On-Site) | Salary: ₹7.5L - ₹13.0L PA</div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="primary" size="sm">Quick Apply</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTERVIEWS & SCHEDULES */}
          {sidebarTab === 'interviews' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Interviews & Schedules</h3>
                <p className="text-xs text-slate-500">Upcoming interview panels, timeslots, and workstation meeting links.</p>
              </div>

              <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold uppercase block">Technical Interview Round</span>
                    <h4 className="font-bold text-sm text-slate-900">Workstation Panel Assessment</h4>
                  </div>
                  <Badge variant="success">Scheduled</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Interviewer:</span>
                    <strong className="text-slate-900">{candidate.assignedInterviewerName || 'Vikram Technical'}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Token Number:</span>
                    <strong className="text-emerald-800 font-mono font-bold">{candidate.tokenNumber || 'TK-101'}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Location:</span>
                    <strong className="text-slate-900">Workstation Station #02</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Status:</span>
                    <strong className="text-blue-900">Live In Queue</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS VAULT */}
          {sidebarTab === 'documents' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Documents Vault & Uploader</h3>
                <p className="text-xs text-slate-500">Upload your Resume, Degree Certificates, Portfolio, Aadhaar, and Experience letters.</p>
              </div>

              {/* Drag and Drop Upload Area */}
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer space-y-2">
                <Upload size={32} className="text-[#034665] mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Drag & Drop files here or click to browse</h4>
                <p className="text-xs text-slate-500">Supports PDF, DOCX, PNG, JPG (Max File Size: 10MB)</p>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2 text-xs">
                {[
                  { name: "Resume_Harsh_Patel_2026.pdf", type: "Resume", size: "1.2 MB", status: "Uploaded" },
                  { name: "Degree_Certificate_GTU.pdf", type: "Certificates", size: "2.4 MB", status: "Uploaded" },
                  { name: "Aadhaar_Card_Verification.pdf", type: "Identity Proof", size: "850 KB", status: "Verified" }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[#034665]" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">{doc.type} &bull; {doc.size}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="success">{doc.status}</Badge>
                      <button className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MY PROFILE EDIT FORM */}
          {sidebarTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Candidate Personal & Academic Profile</h3>
                <p className="text-xs text-slate-500">Update your contact details, academic scores, and portfolio links.</p>
              </div>

              {profileSavedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold">
                  {profileSavedMsg}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileData.fullName}
                      onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={profileData.mobile}
                      onChange={e => setProfileData({ ...profileData, mobile: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">College Name</label>
                    <input
                      type="text"
                      value={profileData.collegeName}
                      onChange={e => setProfileData({ ...profileData, collegeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Branch / Stream</label>
                    <input
                      type="text"
                      value={profileData.branch}
                      onChange={e => setProfileData({ ...profileData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">10th Score (%)</label>
                    <input
                      type="text"
                      value={profileData.tenthPercentage}
                      onChange={e => setProfileData({ ...profileData, tenthPercentage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">12th Score (%)</label>
                    <input
                      type="text"
                      value={profileData.twelfthPercentage}
                      onChange={e => setProfileData({ ...profileData, twelfthPercentage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Diploma Score</label>
                    <input
                      type="text"
                      value={profileData.diplomaPercentage}
                      onChange={e => setProfileData({ ...profileData, diplomaPercentage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Current CPI/SPI</label>
                    <input
                      type="text"
                      value={profileData.currentCpiSpi}
                      onChange={e => setProfileData({ ...profileData, currentCpiSpi: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={profileData.skills}
                    onChange={e => setProfileData({ ...profileData, skills: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Portfolio Link</label>
                    <input
                      type="text"
                      value={profileData.portfolioUrl}
                      onChange={e => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={profileData.linkedinUrl}
                      onChange={e => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">GitHub Profile</label>
                    <input
                      type="text"
                      value={profileData.githubUrl}
                      onChange={e => setProfileData({ ...profileData, githubUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <Button variant="primary" size="md" type="submit">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {sidebarTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Notification Center</h3>
                <p className="text-xs text-slate-500">Real-time alerts for interview schedules, stage changes, and resume reviews.</p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { title: "Technical Interview Call Alert", desc: "You have been called for Technical Interview Round.", time: "10 mins ago", unread: true },
                  { title: "Interviewer Assigned", desc: `Assigned Panel: ${candidate.assignedInterviewerName || 'Vikram Technical'}`, time: "30 mins ago", unread: true },
                  { title: "Reception Token Generated", desc: `Assigned Token Number: ${candidate.tokenNumber || 'TK-101'}`, time: "1 hour ago", unread: false }
                ].map((notif, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border transition ${
                      notif.unread ? 'bg-blue-50/70 border-blue-200 font-semibold' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#034665]">{notif.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                    </div>
                    <p className="text-slate-600">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {sidebarTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Account & Notification Settings</h3>
                <p className="text-xs text-slate-500">Manage communication preferences and account options.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase">Communication Preferences</h4>
                  
                  <div className="flex items-center justify-between">
                    <span>Receive Email Notifications for Interview Calls</span>
                    <input 
                      type="checkbox" 
                      checked={settingsData.emailNotif} 
                      onChange={e => setSettingsData({ ...settingsData, emailNotif: e.target.checked })} 
                      className="w-4 h-4 text-[#034665] rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t pt-2">
                    <span>Receive SMS Alerts for Token Updates</span>
                    <input 
                      type="checkbox" 
                      checked={settingsData.smsNotif} 
                      onChange={e => setSettingsData({ ...settingsData, smsNotif: e.target.checked })} 
                      className="w-4 h-4 text-[#034665] rounded"
                    />
                  </div>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-rose-900 uppercase">Danger Zone</h4>
                  <p className="text-slate-600">Delete candidate profile and application record from recruitment drive.</p>
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                    Delete Account & Data
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CONFIRMATION DIALOG MODAL FOR ACCOUNT DELETION */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          onLogout();
        }}
        title="Delete Candidate Profile"
        message="Are you sure you want to permanently delete your candidate record? This action cannot be undone."
        confirmText="Yes, Delete Record"
        danger={true}
      />
    </div>
  );
};
