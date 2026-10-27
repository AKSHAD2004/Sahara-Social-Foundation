// Master CRM Layout Component
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import CrmSidebar from './CrmSidebar';
import CrmHeader from './CrmHeader';
import CrmMobileBottomBar from './CrmMobileBottomBar';
import { setupFirestoreRealtimeSync } from '../../services/db';
import '../../styles/crm.css';

export default function CrmLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Ensure all CRM administrative collections are subscribed in real-time
    setupFirestoreRealtimeSync(true);
  }, []);

  return (
    <div className="crm-app-container">
      <CrmSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div 
          className="crm-mobile-backdrop" 
          onClick={() => setMobileOpen(false)}
          aria-label="Close Sidebar"
        />
      )}

      <div className={`crm-main-wrap ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <CrmHeader onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="crm-content">
          <Outlet />
        </main>
        <CrmMobileBottomBar onToggleMenu={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
