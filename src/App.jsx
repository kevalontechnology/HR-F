import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { ERPLayout } from './components/layout/ERPLayout';

import { Dashboard } from './pages/Dashboard';
import { Reception } from './pages/Reception';
import { CandidateManagement } from './pages/CandidateManagement';
import { TechnicalWorkstation } from './pages/TechnicalWorkstation';
import { PracticalWorkstation } from './pages/PracticalWorkstation';
import { HREvaluationWorkstation } from './pages/HREvaluationWorkstation';
import { PanelManagement } from './pages/PanelManagement';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { RoleManagement } from './pages/RoleManagement';
import { PermissionManagement } from './pages/PermissionManagement';
import { SkillsMaster } from './pages/SkillsMaster';
import { ProfileMaster } from './pages/ProfileMaster';
import { RecruitmentDrives } from './pages/RecruitmentDrives';
import { TechnicalQuestionBank } from './pages/TechnicalQuestionBank';
import { PracticalTaskBank } from './pages/PracticalTaskBank';
import { NotificationManagement } from './pages/NotificationManagement';
import { AuditLogs } from './pages/AuditLogs';

export const App = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'reception':
        return <Reception />;
      case 'candidates':
        return <CandidateManagement />;
      case 'tech_workstation':
        return <TechnicalWorkstation />;
      case 'practical_workstation':
        return <PracticalWorkstation />;
      case 'hr_workstation':
        return <HREvaluationWorkstation />;
      case 'panels':
        return <PanelManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'roles':
        return <RoleManagement />;
      case 'permissions':
        return <PermissionManagement />;
      case 'skills':
        return <SkillsMaster />;
      case 'profiles':
        return <ProfileMaster />;
      case 'drives':
        return <RecruitmentDrives />;
      case 'questions':
        return <TechnicalQuestionBank />;
      case 'tasks':
        return <PracticalTaskBank />;
      case 'notifications':
        return <NotificationManagement />;
      case 'audit':
        return <AuditLogs />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <ERPLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveModule()}
    </ERPLayout>
  );
};

export default App;
