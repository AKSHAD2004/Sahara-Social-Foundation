// Master CRM Layout Component
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CrmSidebar from './CrmSidebar';
import CrmHeader from './CrmHeader';
import '../../styles/crm.css';

export default function CrmLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="crm-app-container">
      <CrmSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`crm-main-wrap ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <CrmHeader onToggleMobile={() => setMobileOpen(!mobileOpen)} />
        <main className="crm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
