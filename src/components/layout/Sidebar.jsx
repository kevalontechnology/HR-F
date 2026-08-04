import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Code, 
  Terminal, 
  UserPlus, 
  Briefcase, 
  Shield, 
  Lock, 
  Wrench, 
  Layers, 
  Calendar, 
  HelpCircle, 
  FileCode, 
  BellRing, 
  FileText,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { hasPermission } = useAuth();

  const menuSections = [
    {
      title: "Core Modules",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'reports_view' },
        { id: 'reception', label: 'Reception & Queue', icon: UserCheck, perm: 'reception_access' },
        { id: 'candidates', label: 'Candidate Master', icon: Users, perm: 'candidates_read' }
      ]
    },
    {
      title: "Interview Workstations",
      items: [
        { id: 'tech_workstation', label: 'Technical Evaluation', icon: Code, perm: 'interviews_execute' },
        { id: 'practical_workstation', label: 'Practical Task Evaluation', icon: Terminal, perm: 'interviews_execute' },
        { id: 'hr_workstation', label: 'HR Evaluation Panel', icon: UserPlus, perm: 'interviews_execute' }
      ]
    },
    {
      title: "Panel & Assignment",
      items: [
        { id: 'panels', label: 'Panel & Capacity Controller', icon: Briefcase, perm: 'panels_read' }
      ]
    },
    {
      title: "Question & Task Banks",
      items: [
        { id: 'questions', label: 'Technical Questions', icon: HelpCircle, perm: 'questions_read' },
        { id: 'tasks', label: 'Practical Tasks', icon: FileCode, perm: 'tasks_read' }
      ]
    },
    {
      title: "User & Role Management",
      items: [
        { id: 'employees', label: 'Employee Master', icon: Users, perm: 'employees_read' },
        { id: 'roles', label: 'Role Management', icon: Shield, perm: 'roles_read' },
        { id: 'permissions', label: 'Permission Matrix', icon: Lock, perm: 'permissions_read' }
      ]
    },
    {
      title: "System Masters",
      items: [
        { id: 'skills', label: 'Skills Master', icon: Wrench, perm: 'skills_read' },
        { id: 'profiles', label: 'Applied Profiles', icon: Layers, perm: 'profiles_read' },
        { id: 'drives', label: 'Recruitment Drives', icon: Calendar, perm: 'drives_read' },
        { id: 'notifications', label: 'Notifications Setup', icon: BellRing, perm: 'notifications_write' },
        { id: 'audit', label: 'Activity Logs', icon: FileText, perm: 'audit_view' }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#023249] text-gray-200 min-h-[calc(100vh-3.5rem)] flex flex-col border-r border-erp-primary flex-shrink-0">
      <div className="p-3 bg-erp-primary text-white text-xs font-bold uppercase tracking-wider border-b border-white/10 flex items-center justify-between">
        <span>Navigation Menu</span>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto space-y-4">
        {menuSections.map((sec, idx) => {
          const visibleItems = sec.items.filter(item => !item.perm || hasPermission(item.perm));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="px-2">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {sec.title}
              </div>
              <div className="mt-1 space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xs transition-colors ${
                        isActive
                          ? 'bg-erp-primary text-white font-semibold border-l-4 border-yellow-400 shadow-xs'
                          : 'hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-yellow-400' : 'text-gray-400'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-yellow-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer System Version */}
      <div className="p-3 border-t border-white/10 bg-black/20 text-[10px] text-gray-400 text-center">
        <div>Kevalon CRM v1.0.0 (Enterprise)</div>
        <div>Connected to REST API</div>
      </div>
    </aside>
  );
};
