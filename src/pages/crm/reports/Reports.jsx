// Comprehensive Reports & Analytics Module for Samarth Kolhapur CRM
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Download, Filter, Calendar, Users, 
  ShoppingBag, Target, Award, ArrowUpRight, TrendingUp 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { dbService } from '../../../services/db';
import ExportButton from '../../../components/crm/ExportButton';
import { SalesBarChart, LeadSourceDonut, ConversionFunnel } from '../../../components/crm/Charts';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [orders, setOrders] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [commissionTx, setCommissionTx] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setOrders(dbService.getAll('orders'));
    setLeads(dbService.getAll('leads'));
    setCustomers(dbService.getAll('customers'));
    setCommissionTx(dbService.getAll('commissionTransactions'));
    setUsers(dbService.getAll('users'));
  }, []);

  // Product-wise sales aggregation
  const productSalesMap = {};
  orders.forEach((o) => {
    o.products?.forEach((p) => {
      if (!productSalesMap[p.name]) {
        productSalesMap[p.name] = { name: p.name, units: 0, revenue: 0 };
      }
      productSalesMap[p.name].units += Number(p.quantity || 1);
      productSalesMap[p.name].revenue += Number(p.total || p.price * p.quantity || 0);
    });
  });
  const productSalesList = Object.values(productSalesMap);

  // Employee-wise sales aggregation
  const employeeSalesMap = {};
  orders.forEach((o) => {
    const empId = o.assignedEmployee || 'Unassigned';
    const emp = users.find((u) => u.id === empId);
    const empName = emp ? emp.name : 'Direct / Website';

    if (!employeeSalesMap[empName]) {
      employeeSalesMap[empName] = { name: empName, ordersCount: 0, totalSales: 0 };
    }
    employeeSalesMap[empName].ordersCount += 1;
    employeeSalesMap[empName].totalSales += Number(o.grandTotal || 0);
  });
  const employeeSalesList = Object.values(employeeSalesMap);

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <BarChart3 size={24} style={{ color: '#1b4d3e' }} /> Executive Reports & Intelligence
          </h1>
          <div className="crm-page-subtitle">
            Detailed performance metrics for sales, leads, commissions, and team productivity
          </div>
        </div>

        <div className="crm-header-btn-group">
          {activeTab === 'sales' && (
            <ExportButton data={productSalesList} filename="Product_Sales_Report" />
          )}
          {activeTab === 'leads' && (
            <ExportButton data={leads} filename="Leads_Report" />
          )}
          {activeTab === 'customers' && (
            <ExportButton data={customers} filename="Customers_Report" />
          )}
          {activeTab === 'commission' && (
            <ExportButton data={commissionTx} filename="Commission_Report" />
          )}
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="crm-tabs">
        <button className={`crm-tab-btn ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
          <ShoppingBag size={15} /> Sales & Product Reports
        </button>
        <button className={`crm-tab-btn ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>
          <Target size={15} /> Lead & Conversion Reports
        </button>
        <button className={`crm-tab-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          <Users size={15} /> Customer Retention Reports
        </button>
        <button className={`crm-tab-btn ${activeTab === 'commission' ? 'active' : ''}`} onClick={() => setActiveTab('commission')}>
          <Award size={15} /> Commission & Slab Reports
        </button>
      </div>

      {/* SALES REPORTS */}
      {activeTab === 'sales' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
            <div className="crm-card" style={{ margin: 0 }}>
              <div className="crm-card-header">
                <h3 className="crm-card-title">
                  <TrendingUp size={18} style={{ color: '#1b4d3e' }} /> Monthly Revenue Trend (FY 2026)
                </h3>
              </div>
              <div className="crm-card-body">
                <SalesBarChart />
              </div>
            </div>

            <div className="crm-card" style={{ margin: 0 }}>
              <div className="crm-card-header">
                <h3 className="crm-card-title">
                  <Users size={18} style={{ color: '#c69214' }} /> Sales Performance by Counselor / Team
                </h3>
              </div>
              <div className="crm-card-body" style={{ padding: 0 }}>
                <div className="crm-table-wrapper">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Counselor / Channel</th>
                        <th>Orders</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeSalesList.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.ordersCount}</td>
                          <td><strong style={{ color: '#1b4d3e' }}>{formatCurrency(item.totalSales)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Product-wise Sales Table */}
          <div className="crm-card">
            <div className="crm-card-header">
              <h3 className="crm-card-title">
                <ShoppingBag size={18} style={{ color: '#1b4d3e' }} /> Product-Wise Sales Breakdown
              </h3>
            </div>
            <div className="crm-card-body" style={{ padding: 0 }}>
              <div className="crm-table-wrapper">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Units Sold</th>
                      <th>Total Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productSalesList.map((p, idx) => (
                      <tr key={idx}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.units} units</td>
                        <td><strong style={{ color: '#1b4d3e' }}>{formatCurrency(p.revenue)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEADS REPORTS */}
      {activeTab === 'leads' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
            <div className="crm-card" style={{ margin: 0 }}>
              <div className="crm-card-header">
                <h3 className="crm-card-title">Lead Sources</h3>
              </div>
              <div className="crm-card-body">
                <LeadSourceDonut />
              </div>
            </div>

            <div className="crm-card" style={{ margin: 0 }}>
              <div className="crm-card-header">
                <h3 className="crm-card-title">Inquiry to Customer Conversion Pipeline</h3>
              </div>
              <div className="crm-card-body">
                <ConversionFunnel />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS REPORTS */}
      {activeTab === 'customers' && (
        <div className="crm-card">
          <div className="crm-card-header">
            <h3 className="crm-card-title">Customer Distribution by Status</h3>
          </div>
          <div className="crm-card-body" style={{ padding: 0 }}>
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Customer Category</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>VIP Patients</strong></td>
                    <td>{customers.filter((c) => c.customerStatus === 'VIP').length}</td>
                    <td>{Math.round((customers.filter((c) => c.customerStatus === 'VIP').length / (customers.length || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Repeat / Active Customers</strong></td>
                    <td>{customers.filter((c) => c.customerStatus === 'Active' || c.customerStatus === 'Repeat Customer').length}</td>
                    <td>{Math.round((customers.filter((c) => c.customerStatus === 'Active' || c.customerStatus === 'Repeat Customer').length / (customers.length || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>New Inquirers</strong></td>
                    <td>{customers.filter((c) => c.customerStatus === 'New').length}</td>
                    <td>{Math.round((customers.filter((c) => c.customerStatus === 'New').length / (customers.length || 1)) * 100)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COMMISSION REPORTS */}
      {activeTab === 'commission' && (
        <div className="crm-card">
          <div className="crm-card-header">
            <h3 className="crm-card-title">Commission Status Summary</h3>
          </div>
          <div className="crm-card-body" style={{ padding: 0 }}>
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Status Category</th>
                    <th>Total Amount</th>
                    <th>Transaction Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Approved Commission</strong></td>
                    <td><strong style={{ color: '#10b981' }}>{formatCurrency(commissionTx.filter((tx) => tx.status === 'Approved').reduce((s, tx) => s + Number(tx.commissionAmount || 0), 0))}</strong></td>
                    <td>{commissionTx.filter((tx) => tx.status === 'Approved').length}</td>
                  </tr>
                  <tr>
                    <td><strong>Pending Approval</strong></td>
                    <td><strong style={{ color: '#f59e0b' }}>{formatCurrency(commissionTx.filter((tx) => tx.status === 'Pending Approval').reduce((s, tx) => s + Number(tx.commissionAmount || 0), 0))}</strong></td>
                    <td>{commissionTx.filter((tx) => tx.status === 'Pending Approval').length}</td>
                  </tr>
                  <tr>
                    <td><strong>Paid & Disbursed</strong></td>
                    <td><strong style={{ color: '#0284c7' }}>{formatCurrency(commissionTx.filter((tx) => tx.status === 'Paid').reduce((s, tx) => s + Number(tx.commissionAmount || 0), 0))}</strong></td>
                    <td>{commissionTx.filter((tx) => tx.status === 'Paid').length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
