import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, GraduationCap, Building2, Ticket, CheckCircle2, 
  FileCode, ShieldAlert, LogOut, Sparkles, MapPin, Globe, Cpu, Award, ArrowRight, UserCheck 
} from 'lucide-react';
import logoImg from '../Kevalon_Technology_Logo_Transparent.png';
import { StageBadge } from '../components/common/Badge';

export const CandidatePortal = ({ candidate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');

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

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none" onContextMenu={e => e.preventDefault()}>
      
      {/* Top Header Navbar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl mb-6">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Kevalon Technology Logo" className="h-10 w-auto object-contain drop-shadow" />
          <div className="border-l border-white/20 pl-3">
            <h1 className="text-sm font-extrabold tracking-wider uppercase text-white">Kevalon Technology</h1>
            <p className="text-[10px] text-blue-300 font-semibold uppercase">Candidate Self-Service Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-black text-white">{candidate.fullName}</div>
            <div className="text-[10px] text-yellow-300 font-mono font-bold">{candidate.candidateCode}</div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-md"
          >
            <LogOut size={14} /> Exit Portal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl mx-auto space-y-6 my-auto">
        
        {/* LIVE INTERVIEW NOTIFICATION & WORKSTATION ROUTING BANNER */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-[#034665] to-slate-900 border-2 border-blue-400/40 rounded-2xl shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  Live Stage Update
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400 animate-spin" />
                {candidate.stage.includes('TECHNICAL') ? 'Technical Interview Call Alert!' :
                 candidate.stage.includes('PRACTICAL') ? 'Practical Task Evaluation In Progress!' :
                 candidate.stage.includes('HR') ? 'HR Final Interview Panel Alert!' :
                 candidate.stage === 'SELECTED' ? 'Selection Confirmation!' :
                 'Waiting in Reception Queue'}
              </h2>

              <p className="text-xs text-blue-100 font-medium">
                {candidate.stage.includes('TECHNICAL') ? (
                  <>Please proceed to your assigned <strong>Technical Interviewer</strong> to begin the question round.</>
                ) : candidate.stage.includes('PRACTICAL') ? (
                  <>Please review your assigned <strong>Practical Coding Tasks</strong> below and begin coding.</>
                ) : candidate.stage.includes('HR') ? (
                  <>Please report to the <strong>HR Evaluation Panel</strong> for behavioral assessment.</>
                ) : candidate.stage === 'SELECTED' ? (
                  <>Congratulations! You have cleared all rounds and been selected at Kevalon Technology.</>
                ) : (
                  <>Your token has been generated. Please wait in the reception lounge for your call.</>
                )}
              </p>
            </div>

            {/* Station & Interviewer Guidance Box */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs space-y-1 min-w-[240px]">
              <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Report to Station / Panel:</div>
              <div className="text-sm font-black text-yellow-300 flex items-center gap-1.5">
                <UserCheck size={16} className="text-emerald-400" />
                {candidate.assignedInterviewerName || 'Pending Auto-Assignment'}
              </div>
              <div className="text-[10px] text-blue-200 font-mono">Assigned Token #: <strong>{candidate.tokenNumber}</strong></div>
            </div>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-white/10 bg-white/5 backdrop-blur-md rounded-xl p-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'profile'
                ? 'bg-[#034665] text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={15} /> Candidate Profile Dossier
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'tasks'
                ? 'bg-[#034665] text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode size={15} /> Assigned Practical Tasks
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              activeTab === 'company'
                ? 'bg-[#034665] text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 size={15} /> About Kevalon Technology
          </button>
        </div>

        {/* TAB 1: CANDIDATE PROFILE DOSSIER */}
        {activeTab === 'profile' && (
          <div className="bg-white/95 backdrop-blur-xl text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Candidate Personal & Academic Dossier</h3>
                <p className="text-xs text-slate-500 font-medium">Registered details for campus recruitment drive.</p>
              </div>
              <StageBadge stage={candidate.stage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Personal Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-[#034665] uppercase border-b pb-1 flex items-center gap-1.5">
                  <User size={15} /> Personal Contact Info
                </h4>
                <div>Full Name: <strong className="text-slate-900 text-sm">{candidate.fullName}</strong></div>
                <div>Candidate Code: <strong className="text-[#034665] font-mono">{candidate.candidateCode}</strong></div>
                <div>Email Address: <strong className="text-slate-800">{candidate.email}</strong></div>
                <div>Mobile Number: <strong className="text-slate-800 font-mono">{candidate.mobile}</strong></div>
                <div>Token Number: <strong className="text-emerald-700 font-mono font-bold">{candidate.tokenNumber}</strong></div>
              </div>

              {/* Campus Academic Performance */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-[#034665] uppercase border-b pb-1 flex items-center gap-1.5">
                  <GraduationCap size={15} /> Academic & Campus Record
                </h4>
                <div>College Name: <strong className="text-slate-900">{candidate.collegeName}</strong></div>
                <div>Branch / Stream: <strong className="text-slate-800">{candidate.branch}</strong></div>
                <div>Enrollment No: <strong className="text-indigo-900 font-mono">{candidate.enrollmentNo}</strong></div>
                <div>Semester: <strong className="text-slate-800">{candidate.semester}</strong></div>
                <div>Current CPI / SPI: <strong className="text-emerald-800 font-bold">{candidate.currentCpiSpi}</strong></div>
              </div>
            </div>

            {/* Academic Score Cards Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-[10px] text-blue-800 font-bold uppercase block">10th Percentage</span>
                <strong className="text-blue-950 text-base font-black">{candidate.tenthPercentage}%</strong>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-[10px] text-indigo-800 font-bold uppercase block">12th Percentage</span>
                <strong className="text-indigo-950 text-base font-black">{candidate.twelfthPercentage}%</strong>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-[10px] text-purple-800 font-bold uppercase block">Diploma Percentage</span>
                <strong className="text-purple-950 text-base font-black">{candidate.diplomaPercentage}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED PRACTICAL TASKS */}
        {activeTab === 'tasks' && (
          <div className="bg-white/95 backdrop-blur-xl text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FileCode size={20} className="text-purple-800" /> Assigned Practical Coding Tasks
                </h3>
                <p className="text-xs text-slate-500 font-medium">Read problem statements carefully. Text copying is protected.</p>
              </div>

              <span className="text-[11px] bg-purple-900 text-white font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                <ShieldAlert size={13} className="text-yellow-400" /> Anti-Copy Protected
              </span>
            </div>

            {candidate.assignedPracticalTasks && candidate.assignedPracticalTasks.length > 0 ? (
              <div className="space-y-4">
                {candidate.assignedPracticalTasks.map((t, idx) => (
                  <div key={idx} className="p-4 border-2 border-purple-200 bg-purple-50/40 rounded-xl space-y-2 shadow-xs">
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

        {/* TAB 3: ABOUT KEVALON TECHNOLOGY */}
        {activeTab === 'company' && (
          <div className="bg-white/95 backdrop-blur-xl text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <img src={logoImg} alt="Kevalon Logo" className="h-10 w-auto object-contain" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Kevalon Technology</h3>
                  <p className="text-xs text-slate-500 font-medium">Innovating Enterprise Software & Digital Solutions</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Kevalon Technology is a premier software development and digital transformation company specializing in building scalable web applications, mobile apps, enterprise ERP solutions, and cloud infrastructure for global clients.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <Cpu size={20} className="text-[#034665] mb-1" />
                <h5 className="font-bold text-slate-900">Core Stacks</h5>
                <p className="text-[11px] text-slate-600">MERN Stack, Python / Django, Next.js, React Native, AWS Cloud</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <Award size={20} className="text-[#034665] mb-1" />
                <h5 className="font-bold text-slate-900">Work Culture</h5>
                <p className="text-[11px] text-slate-600">Fast-paced learning, live production projects, mentorship, career growth</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <MapPin size={20} className="text-[#034665] mb-1" />
                <h5 className="font-bold text-slate-900">Headquarters</h5>
                <p className="text-[11px] text-slate-600">Ahmedabad, Gujarat, India. www.kevalontechnology.com</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-5xl mx-auto mt-6 text-center text-xs text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} Kevalon Technology Enterprise Systems. All rights reserved.
      </footer>
    </div>
  );
};
