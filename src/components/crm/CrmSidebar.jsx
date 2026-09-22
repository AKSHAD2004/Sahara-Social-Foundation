// CRM Admin Sidebar with collapsible subitems and responsive menu
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Target, Calendar, ShoppingBag, 
  Package, Handshake, Percent, CreditCard, LifeBuoy, 
  BarChart3, Bell, UserCheck, Settings, ChevronDown, 
  ChevronRight, FileText, ChevronLeft, Award, Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MissionLogoBadge from '../MissionLogoBadge';
import UserAvatar from './UserAvatar';

export default function CrmSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { currentUser, isAffiliate } = useAuth();
  const location = useLocation();
  const [commissionOpen, setCommissionOpen] = useState(
    location.pathname.startsWith('/crm/commission')
  );

  return (
    <aside className={`crm-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="crm-sidebar-header">
        <NavLink to="/crm" className="crm-brand-link" onClick={onCloseMobile}>
          <MissionLogoBadge size={collapsed ? 30 : 34} style={{ filter: 'none', flexShrink: 0 }} />
          {!collapsed && (
            <div>
              <div style={{ lineHeight: 1.1 }}>Samarth CRM</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>
                Sahara Social Foundation
              </div>
            </div>
          )}
        </NavLink>

        <button 
          className="crm-sidebar-toggle" 
          onClick={onToggleCollapse} 
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="crm-sidebar-nav">
        {/* If logged in as Affiliate, show restricted portal navigation */}
        {isAffiliate ? (
          <>
            <div className="crm-nav-section-title">{!collapsed && 'Affiliate Portal'}</div>
            <NavLink to="/crm/affiliate-portal" className="crm-nav-link" onClick={onCloseMobile}>
              <LayoutDashboard size={18} />
              {!collapsed && <span>My Dashboard</span>}
            </NavLink>
            <NavLink to="/crm/leads" className="crm-nav-link" onClick={onCloseMobile}>
              <Target size={18} />
              {!collapsed && <span>My Referred Leads</span>}
            </NavLink>
            <NavLink to="/crm/orders" className="crm-nav-link" onClick={onCloseMobile}>
              <ShoppingBag size={18} />
              {!collapsed && <span>My Referred Orders</span>}
            </NavLink>
            <NavLink to="/crm/commission/transactions" className="crm-nav-link" onClick={onCloseMobile}>
              <Award size={18} />
              {!collapsed && <span>My Commission & Payouts</span>}
            </NavLink>
          </>
        ) : (
          <>
            {/* Core Overview */}
            <div className="crm-nav-section-title">{!collapsed && 'Core'}</div>
            <NavLink to="/crm" end className="crm-nav-link" onClick={onCloseMobile}>
              <LayoutDashboard size={18} />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            {/* Sales & Relationships */}
            <div className="crm-nav-section-title">{!collapsed && 'Sales & Customers'}</div>
            <NavLink to="/crm/customers" className="crm-nav-link" onClick={onCloseMobile}>
              <Users size={18} />
              {!collapsed && <span>Customers</span>}
            </NavLink>

            <NavLink to="/crm/leads" className="crm-nav-link" onClick={onCloseMobile}>
              <Target size={18} />
              {!collapsed && <span>Leads</span>}
            </NavLink>

            <NavLink to="/crm/followups" className="crm-nav-link" onClick={onCloseMobile}>
              <Calendar size={18} />
              {!collapsed && <span>Follow-ups</span>}
            </NavLink>

            {/* Commerce & Inventory */}
            <div className="crm-nav-section-title">{!collapsed && 'Operations'}</div>
            <NavLink to="/crm/orders" className="crm-nav-link" onClick={onCloseMobile}>
              <ShoppingBag size={18} />
              {!collapsed && <span>Orders</span>}
            </NavLink>

            <NavLink to="/crm/products" className="crm-nav-link" onClick={onCloseMobile}>
              <Package size={18} />
              {!collapsed && <span>Products</span>}
            </NavLink>

            <NavLink to="/crm/affiliates" className="crm-nav-link" onClick={onCloseMobile}>
              <Handshake size={18} />
              {!collapsed && <span>Affiliates & Team</span>}
            </NavLink>

            {/* Commission Engine Submenu */}
            <div className="crm-nav-section-title">{!collapsed && 'Commission & Finance'}</div>
            <div>
              <div 
                className={`crm-nav-link ${location.pathname.startsWith('/crm/commission') ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setCommissionOpen(!commissionOpen)}
              >
                <Percent size={18} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1 }}>Commission</span>
                    {commissionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </>
                )}
              </div>

              {!collapsed && commissionOpen && (
                <div className="crm-nav-subitems">
                  <NavLink to="/crm/commission" end className="crm-nav-sublink" onClick={onCloseMobile}>
                    • Commission Dashboard
                  </NavLink>
                  <NavLink to="/crm/commission/slabs" className="crm-nav-sublink" onClick={onCloseMobile}>
                    • Slab Rules
                  </NavLink>
                  <NavLink to="/crm/commission/employees" className="crm-nav-sublink" onClick={onCloseMobile}>
                    • Employee Commission
                  </NavLink>
                  <NavLink to="/crm/commission/transactions" className="crm-nav-sublink" onClick={onCloseMobile}>
                    • Commission Transactions
                  </NavLink>
                  <NavLink to="/crm/commission/payouts" className="crm-nav-sublink" onClick={onCloseMobile}>
                    • Commission Payouts
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/crm/payments" className="crm-nav-link" onClick={onCloseMobile}>
              <CreditCard size={18} />
              {!collapsed && <span>Payments</span>}
            </NavLink>

            <NavLink to="/crm/support" className="crm-nav-link" onClick={onCloseMobile}>
              <LifeBuoy size={18} />
              {!collapsed && <span>Support Tickets</span>}
            </NavLink>

            {/* Analytics & Management */}
            <div className="crm-nav-section-title">{!collapsed && 'Insights & Admin'}</div>
            <NavLink to="/crm/reports" className="crm-nav-link" onClick={onCloseMobile}>
              <BarChart3 size={18} />
              {!collapsed && <span>Reports & Analytics</span>}
            </NavLink>

            <NavLink to="/crm/notifications" className="crm-nav-link" onClick={onCloseMobile}>
              <Bell size={18} />
              {!collapsed && <span>Notifications</span>}
            </NavLink>

            <NavLink to="/crm/users" className="crm-nav-link" onClick={onCloseMobile}>
              <UserCheck size={18} />
              {!collapsed && <span>Users & Roles</span>}
            </NavLink>

            <NavLink to="/crm/audit-logs" className="crm-nav-link" onClick={onCloseMobile}>
              <FileText size={18} />
              {!collapsed && <span>Audit Logs</span>}
            </NavLink>

            <NavLink to="/crm/settings" className="crm-nav-link" onClick={onCloseMobile}>
              <Settings size={18} />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </>
        )}

        {/* Link back to public website */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/" target="_blank" rel="noreferrer" className="crm-nav-link" style={{ color: '#94a3b8' }}>
            <ExternalLink size={16} />
            {!collapsed && <span>View Public Website</span>}
          </a>
        </div>
      </nav>

      {/* User Summary in Sidebar Footer */}
      {!collapsed && (
        <div className="crm-sidebar-footer">
          <div className="crm-user-profile-summary">
            <UserAvatar 
              name={currentUser?.name || 'Admin'}
              avatar={currentUser?.avatar} 
              size={36}
            />
            <div className="crm-user-meta">
              <div className="crm-user-name">{currentUser?.name || 'Admin'}</div>
              <span className="crm-user-role-tag">
                {currentUser?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
