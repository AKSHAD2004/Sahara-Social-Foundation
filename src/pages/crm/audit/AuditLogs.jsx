// Security and Operations Audit Trail for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Shield, Clock } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import ExportButton from '../../../components/crm/ExportButton';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  useEffect(() => {
    const unsub = dbService.subscribe('auditLogs', setLogs);
    return unsub;
  }, []);

  const filteredLogs = logs.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      (l.description && l.description.toLowerCase().includes(q)) ||
      (l.userName && l.userName.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q));

    const matchModule = moduleFilter === 'ALL' || l.module?.toLowerCase() === moduleFilter.toLowerCase();
    return matchSearch && matchModule;
  });

  const csvColumns = [
    { header: 'Timestamp', key: 'timestamp' },
    { header: 'User', key: 'userName' },
    { header: 'Action', key: 'action' },
    { header: 'Module', key: 'module' },
    { header: 'Description', key: 'description' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <FileText size={24} style={{ color: '#1b4d3e' }} /> System Activity & Audit Trail
          </h1>
          <div className="crm-page-subtitle">
            Immutable log of all commission approvals, slab changes, user logins, and order status transitions
          </div>
        </div>

        <div className="crm-header-btn-group">
          <ExportButton data={filteredLogs} columns={csvColumns} filename="CRM_Audit_Logs" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="crm-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search audit trail by user, action, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-toolbar-filters">
            <select
              className="crm-select"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="ALL">All Modules</option>
              <option value="Commission">Commission</option>
              <option value="Orders">Orders</option>
              <option value="Leads">Leads</option>
              <option value="Customers">Customers</option>
              <option value="Auth">Auth & Sessions</option>
              <option value="Settings">Settings</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Responsible User</th>
                <th>Action Type</th>
                <th>Module</th>
                <th>Change Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600 }}>{formatDate(log.timestamp, true)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{log.userName}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#1b4d3e' }}>{log.module}</strong>
                  </td>
                  <td style={{ maxWidth: '400px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>{log.description}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
