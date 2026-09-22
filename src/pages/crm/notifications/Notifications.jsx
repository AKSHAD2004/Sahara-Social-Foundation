// Notifications Center for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { dbService } from '../../../services/db';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsub = dbService.subscribe('notifications', setNotifications);
    return unsub;
  }, []);

  const handleMarkAllRead = () => {
    dbService.markAllNotificationsRead();
  };

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Bell size={24} style={{ color: '#1b4d3e' }} /> Notification Center
          </h1>
          <div className="crm-page-subtitle">
            Real-time alerts for new leads, pending commissions, and order events ({notifications.length} alerts)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button className="crm-btn crm-btn-secondary" onClick={handleMarkAllRead}>
            <CheckCircle2 size={16} /> Mark All as Read
          </button>
        </div>
      </div>

      <div className="crm-card">
        <div className="crm-card-body" style={{ padding: 0 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              No notifications at this time.
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #f1f5f9',
                    background: n.read ? '#ffffff' : '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{n.message}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      {formatDate(n.timestamp, true)}
                    </div>
                  </div>
                  {n.link && (
                    <a href={n.link} className="crm-btn crm-btn-secondary crm-btn-sm">
                      View <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
