import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  Code, 
  Terminal, 
  UserCheck, 
  CheckCircle2, 
  PauseCircle, 
  XCircle, 
  Briefcase,
  Building2,
  RefreshCw
} from 'lucide-react';
import { StageBadge } from '../components/common/Badge';

export const Dashboard = ({ setActiveTab }) => {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await authFetch('/api/reports/dashboard');
      if (statsRes.success) setStats(statsRes.stats);

      const candRes = await authFetch('/api/candidates');
      if (candRes.success) setRecentCandidates((candRes.data || []).slice(0, 8));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const metricCards = [
    { label: "Today's Interviews", val: stats?.todayInterviews || 0, icon: CalendarCheck, color: "border-blue-600 text-blue-700 bg-blue-50" },
    { label: "Total Candidates", val: stats?.totalCandidates || 0, icon: Users, color: "border-indigo-600 text-indigo-700 bg-indigo-50" },
    { label: "Waiting Queue", val: stats?.waitingQueue || 0, icon: Clock, color: "border-yellow-600 text-yellow-700 bg-yellow-50" },
    { label: "Technical Running", val: stats?.technicalRunning || 0, icon: Code, color: "border-cyan-600 text-cyan-700 bg-cyan-50" },
    { label: "Practical Running", val: stats?.practicalRunning || 0, icon: Terminal, color: "border-purple-600 text-purple-700 bg-purple-50" },
    { label: "HR Running", val: stats?.hrRunning || 0, icon: UserCheck, color: "border-teal-600 text-teal-700 bg-teal-50" },
    { label: "Selected Candidates", val: stats?.selectedCount || 0, icon: CheckCircle2, color: "border-emerald-600 text-emerald-700 bg-emerald-50" },
    { label: "On Hold", val: stats?.holdCount || 0, icon: PauseCircle, color: "border-amber-600 text-amber-700 bg-amber-50" },
    { label: "Rejected Candidates", val: stats?.rejectedCount || 0, icon: XCircle, color: "border-red-600 text-red-700 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <Building2 size={20} /> Kevalon Technology Executive Dashboard
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Real-time pipeline monitoring, queue status, and interviewer capacities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadDashboardData}
            className="btn-erp-secondary flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
          <button 
            onClick={() => setActiveTab('reception')}
            className="btn-erp-primary flex items-center gap-1.5"
          >
            <UserCheck size={14} /> Candidate Reception Check-In
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-4 bg-white border-l-4 rounded-xs shadow-xs border ${card.color.split(' ')[0]} flex items-center justify-between`}>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{card.label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : card.val}</div>
              </div>
              <div className={`p-2.5 rounded-xs ${card.color.split(' ')[2]}`}>
                <Icon size={22} className={card.color.split(' ')[1]} />
              </div>
            </div>
          );
        })}
      </div>

      {/* System Quick Overview & Recent Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Pipeline Table */}
        <div className="lg:col-span-2 bg-white border border-erp-border rounded-xs shadow-xs overflow-hidden">
          <div className="bg-erp-primary text-white px-4 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Recent Candidate Activity Pipeline</span>
            <button onClick={() => setActiveTab('candidates')} className="text-yellow-300 hover:underline text-[11px]">
              View All Candidate Master &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Token #</th>
                  <th>Candidate Name</th>
                  <th>Applied Profile</th>
                  <th>Current Stage</th>
                  <th>Assigned Interviewer</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      No candidate activity recorded.
                    </td>
                  </tr>
                ) : (
                  recentCandidates.map((c) => (
                    <tr key={c._id}>
                      <td className="font-bold text-erp-primary">{c.tokenNumber || 'N/A'}</td>
                      <td className="font-semibold">{c.fullName}</td>
                      <td>{c.appliedProfileId?.title || 'N/A'}</td>
                      <td><StageBadge stage={c.stage} /></td>
                      <td className="text-xs">
                        {c.assignedTechnicalInterviewer?.fullName || c.assignedPracticalInterviewer?.fullName || c.assignedHrInterviewer?.fullName || 'Queue / Unassigned'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Workstation Shortcuts Card */}
        <div className="bg-white border border-erp-border rounded-xs shadow-xs p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-erp-primary border-b pb-2">
            Interviewer Workstation Shortcuts
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('tech_workstation')}
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xs hover:bg-blue-100 flex items-center justify-between text-left transition"
            >
              <div>
                <div className="font-bold text-blue-900 text-xs uppercase">Technical Workstation</div>
                <div className="text-[11px] text-blue-700">Random 10 Questions evaluation & scoring</div>
              </div>
              <Code size={18} className="text-blue-800" />
            </button>

            <button
              onClick={() => setActiveTab('practical_workstation')}
              className="w-full p-3 bg-purple-50 border border-purple-200 rounded-xs hover:bg-purple-100 flex items-center justify-between text-left transition"
            >
              <div>
                <div className="font-bold text-purple-900 text-xs uppercase">Practical Task Workstation</div>
                <div className="text-[11px] text-purple-700">Random 2 Tasks drawer & code marking</div>
              </div>
              <Terminal size={18} className="text-purple-800" />
            </button>

            <button
              onClick={() => setActiveTab('hr_workstation')}
              className="w-full p-3 bg-teal-50 border border-teal-200 rounded-xs hover:bg-teal-100 flex items-center justify-between text-left transition"
            >
              <div>
                <div className="font-bold text-teal-900 text-xs uppercase">HR Evaluation Panel</div>
                <div className="text-[11px] text-teal-700">Behavioral rating & final hiring decision</div>
              </div>
              <UserCheck size={18} className="text-teal-800" />
            </button>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xs text-[11px] text-gray-600">
            <strong>System Rule:</strong> Candidates are auto-assigned to the least busy eligible interviewer matching required skills.
          </div>
        </div>
      </div>
    </div>
  );
};
