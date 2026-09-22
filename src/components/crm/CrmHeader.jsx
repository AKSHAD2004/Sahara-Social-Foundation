// Top Navigation Header with Search, Role Switcher, and Notifications for CRM
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Menu, LogOut, ShieldCheck, Check, 
  User, ExternalLink, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';

export default function CrmHeader({ onToggleMobile }) {
  const { currentUser, logout, switchUser, availableUsers } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const unsub = dbService.subscribe('notifications', (notifs) => {
      setNotifications(notifs || []);
    });
    return unsub;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    const q = query.toLowerCase();
    const customers = dbService.getAll('customers').filter((c) => 
      c.fullName.toLowerCase().includes(q) || 
      c.mobileNumber.includes(q) || 
      c.customerId.toLowerCase().includes(q)
    );
    const leads = dbService.getAll('leads').filter((l) => 
      l.customerName.toLowerCase().includes(q) || 
      l.mobile.includes(q) || 
      l.leadId.toLowerCase().includes(q)
    );
    const orders = dbService.getAll('orders').filter((o) => 
      o.orderId.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q)
    );

    setSearchResults({ customers, leads, orders });
  };

  const handleSelectSearchResult = (type, item) => {
    setSearchResults(null);
    setSearchTerm('');
    if (type === 'customer') navigate('/crm/customers');
    if (type === 'lead') navigate('/crm/leads');
    if (type === 'order') navigate('/crm/orders');
  };

  const handleMarkAllRead = () => {
    dbService.markAllNotificationsRead();
  };

  return (
    <header className="crm-header">
      {/* Mobile Hamburger + Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="crm-sidebar-toggle" 
          style={{ display: 'flex' }}
          onClick={onToggleMobile}
          title="Toggle Mobile Menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ position: 'relative' }}>
          <div className="crm-header-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search customers, leads, orders (e.g. Patil, ORD-2026)..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Search Dropdown Popup */}
          {searchResults && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '380px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              marginTop: '8px',
              zIndex: 1000,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '0.75rem'
            }}>
              {searchResults.customers.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Customers ({searchResults.customers.length})
                  </div>
                  {searchResults.customers.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => handleSelectSearchResult('customer', c)}
                      style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <strong>{c.fullName}</strong> • <span style={{ color: '#64748b' }}>{c.customerId} ({c.mobileNumber})</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.leads.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Leads ({searchResults.leads.length})
                  </div>
                  {searchResults.leads.map((l) => (
                    <div 
                      key={l.id} 
                      onClick={() => handleSelectSearchResult('lead', l)}
                      style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <strong>{l.customerName}</strong> • <span style={{ color: '#64748b' }}>{l.leadId} ({l.leadStatus})</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.orders.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Orders ({searchResults.orders.length})
                  </div>
                  {searchResults.orders.map((o) => (
                    <div 
                      key={o.id} 
                      onClick={() => handleSelectSearchResult('order', o)}
                      style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <strong>{o.orderId}</strong> - {o.customerName} • <span style={{ color: '#1b4d3e', fontWeight: 600 }}>₹{o.grandTotal}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.customers.length === 0 && searchResults.leads.length === 0 && searchResults.orders.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  No matching records found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="crm-header-actions">
        {/* Instant Role Switcher for Evaluation */}
        <div className="crm-role-switcher" title="Instantly switch user to test RBAC and role experiences">
          <ShieldCheck size={16} />
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Active Role:</span>
          <select 
            className="crm-role-select" 
            value={currentUser?.id || ''}
            onChange={(e) => switchUser(e.target.value)}
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace('_', ' ').toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Icon with Popup */}
        <div style={{ position: 'relative' }}>
          <button 
            className="crm-icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="crm-notif-indicator" />}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: '320px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications ({unreadCount} unread)</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead} 
                    style={{ background: 'none', border: 'none', color: '#1b4d3e', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>No notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', background: n.read ? '#ffffff' : '#f0fdf4' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button 
          className="crm-icon-btn" 
          onClick={logout} 
          title="Sign out of CRM"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
