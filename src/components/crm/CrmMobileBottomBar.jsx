// Mobile Bottom Navigation Bar for Sahara Social Foundation CRM
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Users, Target, Menu, Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CrmMobileBottomBar({ onToggleMenu }) {
  const { isAffiliate } = useAuth();
  const location = useLocation();

  const isExactActive = (path) => location.pathname === path;
  const isPrefixActive = (prefix) => location.pathname.startsWith(prefix);

  return (
    <nav className="crm-mobile-bottom-bar" aria-label="CRM Mobile Navigation">
      {isAffiliate ? (
        <>
          <NavLink 
            to="/crm/affiliate-portal" 
            end 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/crm/orders" 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </NavLink>
          <NavLink 
            to="/crm/leads" 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Target size={20} />
            <span>Leads</span>
          </NavLink>
          <NavLink 
            to="/crm/commission/transactions" 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Award size={20} />
            <span>Earnings</span>
          </NavLink>
        </>
      ) : (
        <>
          <NavLink 
            to="/crm" 
            end 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/crm/orders" 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </NavLink>
          <NavLink 
            to="/crm/customers" 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>Customers</span>
          </NavLink>
          <NavLink 
            to="/crm/leads" 
            className={({ isActive }) => `crm-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Target size={20} />
            <span>Leads</span>
          </NavLink>
        </>
      )}

      {/* Full Menu Drawer Opener */}
      <button 
        type="button" 
        className="crm-bottom-nav-item crm-bottom-menu-trigger" 
        onClick={onToggleMenu}
        aria-label="Open Full CRM Menu"
      >
        <Menu size={20} />
        <span>All Menu</span>
      </button>
    </nav>
  );
}
