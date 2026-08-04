import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/common/DataTable';
import { FileText, ShieldAlert } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const AuditLogs = () => {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await authFetch('/api/audit/logs');
      if (res.success) setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    { header: 'Timestamp', accessor: 'createdAt', render: l => (
      <span className="text-[11px] text-gray-600">{new Date(l.createdAt).toLocaleString()}</span>
    )},
    { header: 'User', accessor: 'username', render: l => <span className="font-bold text-erp-primary">{l.username}</span> },
    { header: 'Module', accessor: 'module', render: l => <Badge variant="primary">{l.module}</Badge> },
    { header: 'Action', accessor: 'action', render: l => <Badge variant="info">{l.action}</Badge> },
    { header: 'Description / Audit Details', accessor: 'description', render: l => (
      <span className="text-xs text-gray-800">{l.description}</span>
    )}
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border border-erp-border rounded-xs shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-erp-primary uppercase tracking-wide flex items-center gap-2">
            <FileText size={18} /> System Audit & Activity Trail Logs
          </h2>
          <p className="text-xs text-gray-600">Enterprise audit trail recording every user action, role change, check-in, & evaluation.</p>
        </div>
      </div>

      <DataTable columns={columns} data={logs} searchPlaceholder="Search audit logs..." />
    </div>
  );
};
