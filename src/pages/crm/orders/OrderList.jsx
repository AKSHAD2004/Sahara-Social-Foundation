// Complete Order Management Module for Sahara Social Foundation CRM
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, Eye, Truck, Globe,
  CreditCard, CheckCircle2, AlertTriangle, ArrowRight, Check, RotateCcw, Trash2 
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../../utils/formatters';
import { dbService, getDeletedSet } from '../../../services/db';
import CrmModal from '../../../components/crm/CrmModal';
import ExportButton from '../../../components/crm/ExportButton';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [activeKpi, setActiveKpi] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [newOrderForm, setNewOrderForm] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    productId: '',
    quantity: 1,
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    paymentMethod: 'UPI',
    assignedEmployee: '',
    assignedAffiliate: '',
    shippingAddress: ''
  });

  const handleRefreshFirebase = async () => {
    setIsSyncing(true);
    setSyncNotice('');
    try {
      const refreshed = await dbService.refreshFromFirebase('orders', true);
      if (Array.isArray(refreshed) && refreshed.length > 0) {
        setOrders(refreshed);
        setSyncNotice(`✓ Synced ${refreshed.length} orders live from Cloud Firestore!`);
      } else {
        setSyncNotice(`✓ Orders are up to date.`);
      }
      setTimeout(() => setSyncNotice(''), 4500);
    } catch (e) {
      setSyncNotice('Sync note: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Active subscription to reactive store as fallback & local store sync
    const unsubOrders = dbService.subscribe('orders', (currentOrders) => {
      const deletedIds = getDeletedSet('orders');
      if (Array.isArray(currentOrders)) {
        setOrders(currentOrders.filter((o) => !deletedIds.has(String(o.id || '')) && !deletedIds.has(String(o.orderId || ''))));
      }
    });

    const unsubCust = dbService.subscribe('customers', setCustomers);
    const unsubProd = dbService.subscribe('products', setProducts);
    const unsubUsers = dbService.subscribe('users', (users) => {
      const activeEmployees = users.filter((u) => u.role !== 'affiliate');
      const activeAffiliates = users.filter((u) => u.role === 'affiliate');
      setEmployees(activeEmployees);
      setAffiliates(activeAffiliates);
      if (activeEmployees.length > 0) {
        setNewOrderForm((prev) => ({
          ...prev,
          assignedEmployee: prev.assignedEmployee || activeEmployees[0].id
        }));
      }
    });

    return () => {
      unsubOrders();
      unsubCust();
      unsubProd();
      unsubUsers();
    };
  }, []);

  const isWebsiteOrder = (o) => {
    const src = String(o.source || '').toLowerCase();
    const idStr = String(o.id || o.orderId || '');
    return src.includes('website') || idStr.startsWith('ORD-') || idStr.startsWith('SSF-');
  };

  const handleKpiClick = (kpiType) => {
    if (activeKpi === kpiType && kpiType !== 'all') {
      setActiveKpi('all');
      setSourceFilter('ALL');
      setPaymentStatusFilter('ALL');
      setOrderStatusFilter('ALL');
    } else {
      setActiveKpi(kpiType);
      if (kpiType === 'all') {
        setSourceFilter('ALL');
        setPaymentStatusFilter('ALL');
        setOrderStatusFilter('ALL');
      } else if (kpiType === 'online') {
        setSourceFilter('WEBSITE');
        setPaymentStatusFilter('ALL');
        setOrderStatusFilter('ALL');
      } else if (kpiType === 'paid') {
        setPaymentStatusFilter('Paid');
        setSourceFilter('ALL');
        setOrderStatusFilter('ALL');
      } else if (kpiType === 'pending_delivery') {
        setPaymentStatusFilter('ALL');
        setSourceFilter('ALL');
        setOrderStatusFilter('ALL');
      }
    }

    setTimeout(() => {
      const target = document.getElementById('orders-table-card');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const filteredOrders = orders
    .filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (o.orderId && o.orderId.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerMobile && String(o.customerMobile).includes(q)) ||
        (o.customerPhone && String(o.customerPhone).includes(q)) ||
        (o.phone && String(o.phone).includes(q));

      const matchOrderStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
      const matchPaymentStatus = paymentStatusFilter === 'ALL' || o.paymentStatus === paymentStatusFilter;
      const isWeb = isWebsiteOrder(o);
      const matchSource = sourceFilter === 'ALL' || (sourceFilter === 'WEBSITE' ? isWeb : !isWeb);

      // Dedicated filter for Pending Delivery KPI
      const matchKpi = activeKpi === 'pending_delivery'
        ? (o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')
        : true;

      return matchSearch && matchOrderStatus && matchPaymentStatus && matchSource && matchKpi;
    })
    .sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdAt || a.syncedAt || 0).getTime();
      const dateB = new Date(b.orderDate || b.createdAt || b.syncedAt || 0).getTime();
      return dateB - dateA;
    });

  const websiteOrdersCount = orders.filter((o) => isWebsiteOrder(o)).length;
  const totalRevenue = orders.filter((o) => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const pendingDeliveryCount = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrderForm.customerName || !newOrderForm.productId) return;

    const prod = products.find((p) => p.id === newOrderForm.productId);
    const prodPrice = prod ? prod.price : 2800;
    const subtotal = prodPrice * Number(newOrderForm.quantity);
    const grandTotal = subtotal;
    const genOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await dbService.add('orders', {
      id: genOrderId,
      orderId: genOrderId,
      customerId: newOrderForm.customerId || `cust_${Date.now()}`,
      customerName: newOrderForm.customerName,
      customerMobile: newOrderForm.customerMobile,
      products: [
        {
          productId: prod?.id,
          name: prod?.name || 'Ayurvedic Supplement Kit',
          quantity: Number(newOrderForm.quantity),
          price: prodPrice,
          total: subtotal
        }
      ],
      quantity: Number(newOrderForm.quantity),
      subtotal,
      discount: 0,
      tax: 0,
      shipping: 0,
      grandTotal,
      eligibleAmount: prod?.commissionEligible !== false ? grandTotal : 0,
      paymentStatus: newOrderForm.paymentStatus,
      orderStatus: newOrderForm.orderStatus,
      paymentMethod: newOrderForm.paymentMethod,
      assignedEmployee: newOrderForm.assignedEmployee || employees[0]?.id || '',
      assignedAffiliate: newOrderForm.assignedAffiliate || '',
      employeeName: employees.find((e) => e.id === newOrderForm.assignedEmployee)?.name || employees[0]?.name || '',
      affiliateName: affiliates.find((a) => a.id === newOrderForm.assignedAffiliate)?.name || '',
      commissionStatus: newOrderForm.orderStatus === 'Cancelled' ? 'Cancelled' : 'Generated',
      orderDate: new Date().toISOString(),
      deliveredDate: newOrderForm.orderStatus === 'Delivered' ? new Date().toISOString() : null,
      shippingAddress: newOrderForm.shippingAddress || 'Kolhapur, Maharashtra'
    });

    setShowAddModal(false);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const isDelivered = newStatus === 'Delivered';
    await dbService.update('orders', orderId, {
      orderStatus: newStatus,
      deliveredDate: isDelivered ? new Date().toISOString() : null
    });
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    await dbService.update('orders', orderId, {
      paymentStatus: newStatus
    });
  };

  const handleCustomerSelect = (custId) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setNewOrderForm({
        ...newOrderForm,
        customerId: cust.id,
        customerName: cust.fullName,
        customerMobile: cust.mobileNumber,
        shippingAddress: `${cust.address || ''}, ${cust.city || ''}, ${cust.state || ''}`,
        assignedEmployee: cust.assignedEmployee || newOrderForm.assignedEmployee,
        assignedAffiliate: cust.assignedAffiliate || ''
      });
    }
  };

  const handleDeleteOrder = async (order) => {
    const orderTitle = order.orderId || order.id;
    if (window.confirm(`Are you sure you want to permanently delete Order #${orderTitle} for "${order.customerName}"? This action cannot be undone.`)) {
      const targetId = order.id || order.orderId;
      const targetOrderId = order.orderId || order.id;

      // Instantly remove from local component view so UI updates immediately
      setOrders((prev) => prev.filter((o) => 
        String(o.id) !== String(targetId) && 
        String(o.orderId) !== String(targetOrderId) &&
        String(o.id) !== String(targetOrderId) &&
        String(o.orderId) !== String(targetId)
      ));

      if (selectedOrder?.id === order.id || selectedOrder?.orderId === order.orderId) {
        setSelectedOrder(null);
      }

      await dbService.delete('orders', targetId);
    }
  };

  const csvColumns = [
    { header: 'Order ID', key: 'orderId' },
    { header: 'Customer', key: 'customerName' },
    { header: 'Grand Total', key: 'grandTotal' },
    { header: 'Payment Status', key: 'paymentStatus' },
    { header: 'Order Status', key: 'orderStatus' },
    { header: 'Payment Method', key: 'paymentMethod' },
    { header: 'Order Date', key: 'orderDate' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <ShoppingBag size={24} style={{ color: '#1b4d3e' }} /> Order Management
          </h1>
          <div className="crm-page-subtitle">
            Synchronized orders from website and phone consultations ({orders.length} total orders, {websiteOrdersCount} from website)
          </div>
        </div>

        <div className="crm-header-btn-group">
          <button 
            className="crm-btn crm-btn-secondary"
            onClick={handleRefreshFirebase}
            disabled={isSyncing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            title="Fetch latest orders live from Cloud Firestore"
          >
            <RotateCcw size={15} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Firebase'}</span>
          </button>
          <ExportButton data={filteredOrders} columns={csvColumns} filename="Sahara_Orders" />
          <button className="crm-btn crm-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Order
          </button>
        </div>
      </div>

      {syncNotice && (
        <div style={{
          backgroundColor: '#e2faea',
          border: '1.5px solid #159B32',
          color: '#006B2D',
          padding: '0.65rem 1.15rem',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,107,45,0.08)'
        }}>
          <CheckCircle2 size={18} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Top Summary Metrics - Clickable Interactive Filter Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Button 1: Total Orders */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('all')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiClick('all')}
          className="crm-stat-card"
          style={{
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeKpi === 'all' ? '2px solid #0f172a' : '1px solid var(--crm-border)',
            backgroundColor: activeKpi === 'all' ? '#f8fafc' : 'var(--crm-surface)',
            boxShadow: activeKpi === 'all' ? '0 4px 14px rgba(15, 23, 42, 0.15)' : 'var(--crm-shadow-sm)',
            transform: activeKpi === 'all' ? 'translateY(-2px)' : 'none'
          }}
          title="Click to view all orders"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span className="crm-stat-label">Total Orders</span>
              {activeKpi === 'all' && (
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#0f172a', backgroundColor: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  ✓ ACTIVE
                </span>
              )}
            </div>
            <div className="crm-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orders.length}</div>
            <div className="crm-stat-subtext">Click to view all channels</div>
          </div>
          <div className="crm-stat-icon-wrap primary" style={{ width: '44px', height: '44px' }}>
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Button 2: Online Orders */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('online')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiClick('online')}
          className="crm-stat-card"
          style={{
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeKpi === 'online' ? '2px solid #006B2D' : '1px solid var(--crm-border)',
            backgroundColor: activeKpi === 'online' ? '#f0fdf4' : 'var(--crm-surface)',
            boxShadow: activeKpi === 'online' ? '0 4px 14px rgba(0, 107, 45, 0.2)' : 'var(--crm-shadow-sm)',
            transform: activeKpi === 'online' ? 'translateY(-2px)' : 'none'
          }}
          title="Click to filter Website & Razorpay online orders"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span className="crm-stat-label">Online Orders</span>
              {activeKpi === 'online' && (
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#006B2D', backgroundColor: '#bbf7d0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  ✓ ACTIVE
                </span>
              )}
            </div>
            <div className="crm-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#006B2D' }}>{websiteOrdersCount}</div>
            <div className="crm-stat-subtext">Click to filter website orders</div>
          </div>
          <div className="crm-stat-icon-wrap success" style={{ width: '44px', height: '44px' }}>
            <Globe size={20} />
          </div>
        </div>

        {/* Button 3: Paid Volume */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('paid')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiClick('paid')}
          className="crm-stat-card"
          style={{
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeKpi === 'paid' ? '2px solid #16a34a' : '1px solid var(--crm-border)',
            backgroundColor: activeKpi === 'paid' ? '#f0fdf4' : 'var(--crm-surface)',
            boxShadow: activeKpi === 'paid' ? '0 4px 14px rgba(22, 163, 74, 0.2)' : 'var(--crm-shadow-sm)',
            transform: activeKpi === 'paid' ? 'translateY(-2px)' : 'none'
          }}
          title="Click to filter Paid orders only"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span className="crm-stat-label">Paid Volume</span>
              {activeKpi === 'paid' && (
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#15803d', backgroundColor: '#bbf7d0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  ✓ ACTIVE
                </span>
              )}
            </div>
            <div className="crm-stat-value" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a' }}>{formatCurrency(totalRevenue)}</div>
            <div className="crm-stat-subtext">Click to filter cleared payments</div>
          </div>
          <div className="crm-stat-icon-wrap accent" style={{ width: '44px', height: '44px' }}>
            <CreditCard size={20} />
          </div>
        </div>

        {/* Button 4: Pending Delivery */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleKpiClick('pending_delivery')}
          onKeyDown={(e) => e.key === 'Enter' && handleKpiClick('pending_delivery')}
          className="crm-stat-card"
          style={{
            padding: '1rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeKpi === 'pending_delivery' ? '2px solid #d97706' : '1px solid var(--crm-border)',
            backgroundColor: activeKpi === 'pending_delivery' ? '#fffbeb' : 'var(--crm-surface)',
            boxShadow: activeKpi === 'pending_delivery' ? '0 4px 14px rgba(217, 119, 6, 0.2)' : 'var(--crm-shadow-sm)',
            transform: activeKpi === 'pending_delivery' ? 'translateY(-2px)' : 'none'
          }}
          title="Click to filter orders pending delivery"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span className="crm-stat-label">Pending Delivery</span>
              {activeKpi === 'pending_delivery' && (
                <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fde68a', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  ✓ ACTIVE
                </span>
              )}
            </div>
            <div className="crm-stat-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>{pendingDeliveryCount}</div>
            <div className="crm-stat-subtext">Click to view pending shipments</div>
          </div>
          <div className="crm-stat-icon-wrap warning" style={{ width: '44px', height: '44px' }}>
            <Truck size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="crm-card" id="orders-table-card">
        <div className="crm-toolbar">
          <div className="crm-toolbar-search">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-toolbar-filters">
            <select
              className="crm-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="ALL">All Order Channels</option>
              <option value="WEBSITE">🌐 Website Online Orders</option>
              <option value="OFFLINE">📞 Direct / Phone Orders</option>
            </select>

            <select
              className="crm-select"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="ALL">All Order Statuses</option>
              <option value="New">New</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="crm-select"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items & Quantity</th>
                <th>Total Value</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Order Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.orderId}</div>
                      {isWebsiteOrder(order) && (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.68rem', 
                          backgroundColor: '#e2faea', 
                          color: '#006B2D', 
                          padding: '0.15rem 0.45rem', 
                          borderRadius: '4px', 
                          fontWeight: 700, 
                          marginTop: '0.25rem' 
                        }}>
                          🌐 Website Order
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customerMobile || order.customerPhone || order.phone}</div>
                      {(order.affiliateName || order.referralCode) && (
                        <div style={{ fontSize: '0.72rem', color: '#006B2D', fontWeight: 600, marginTop: '2px' }}>
                          Ref: {order.referralCode || order.affiliateName}
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      {(order.products || order.items || []).map((p, idx) => (
                        <div key={idx} style={{ fontSize: '0.82rem' }}>
                          • {p.name || p.nameMr || p.nameEn || p.title || 'Nutraceutical Formula'} × {p.quantity || 1}
                        </div>
                      ))}
                    </td>
                    <td>
                      <strong style={{ color: '#1b4d3e' }}>{formatCurrency(order.grandTotal)}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.paymentMethod}</div>
                    </td>
                    <td>
                      <select
                        className="crm-select"
                        style={{ fontSize: '0.78rem', padding: '0.2rem 0.4rem' }}
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="crm-select"
                        style={{ fontSize: '0.78rem', padding: '0.2rem 0.4rem' }}
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          className="crm-btn crm-btn-secondary crm-btn-sm"
                          onClick={() => setSelectedOrder(order)}
                          title="View Order Details & Invoice"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          className="crm-icon-btn"
                          style={{
                            width: '30px',
                            height: '30px',
                            color: '#ef4444',
                            border: '1px solid #fee2e2',
                            borderRadius: '6px',
                            backgroundColor: '#fff'
                          }}
                          onClick={() => handleDeleteOrder(order)}
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order / Bill Invoice Modal */}
      {selectedOrder && (
        <CrmModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Official Bill & Invoice: ${selectedOrder.orderId}`}
          size="lg"
        >
          <div id="crm-print-invoice-area" style={{ background: '#ffffff', padding: '1.25rem', border: '1px solid #E1E9DF', borderRadius: '12px', marginBottom: '1.25rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #006B2D', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#006B2D', margin: 0 }}>
                  सहारा सोशल फाऊंडेशन, कोल्हापूर
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#5F6B61', marginTop: '0.2rem' }}>
                  Sahara Social Foundation • Reg. No. MAH/582/2014/KOP
                </div>
                <div style={{ fontSize: '0.78rem', color: '#159B32', fontWeight: 600, marginTop: '0.15rem' }}>
                  हेल्पलाईन: +91 93700 84701 / +91 93700 84702
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block',
                  backgroundColor: '#e2faea', 
                  color: '#006B2D', 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  padding: '0.35rem 0.85rem', 
                  borderRadius: '6px' 
                }}>
                  OFFICIAL TAX INVOICE / बिल
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#17251B', marginTop: '0.4rem' }}>
                  Invoice #: {selectedOrder.orderId}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Date: {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Bill Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Billed To (ग्राहक):</span>
                <div style={{ fontWeight: 700, color: '#17251B', fontSize: '0.95rem', marginTop: '0.15rem' }}>{selectedOrder.customerName}</div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.15rem' }}>
                  {selectedOrder.shippingAddress || 'Address on file'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#006B2D', fontWeight: 600, marginTop: '0.2rem' }}>
                  Mobile: {selectedOrder.customerMobile || selectedOrder.customerPhone || selectedOrder.phone || 'N/A'}
                </div>
                {selectedOrder.customerEmail && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Email: {selectedOrder.customerEmail}</div>
                )}
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Payment & Order Summary:</span>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  <strong>Payment Mode:</strong> {selectedOrder.paymentMethod || 'Online'}
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>
                  <strong>Payment Status:</strong>{' '}
                  <span style={{
                    color: selectedOrder.paymentStatus === 'Paid' ? '#159B32' : '#d97706',
                    fontWeight: 800
                  }}>
                    {selectedOrder.paymentStatus === 'Paid' ? 'Paid (पूर्ण भरणा ✓)' : selectedOrder.paymentStatus}
                  </span>
                </div>
                {selectedOrder.transactionId && (
                  <div style={{ fontSize: '0.78rem', color: '#006B2D', fontWeight: 600, marginTop: '0.15rem' }}>
                    Txn ID: {selectedOrder.transactionId}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>
                  <strong>Order Status:</strong> {selectedOrder.orderStatus}
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 700, color: '#17251B' }}>Items Billed:</h4>
            <div className="crm-table-wrapper" style={{ marginBottom: '1rem' }}>
              <table className="crm-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ textAlign: 'left' }}>Item / Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Rate</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.products || selectedOrder.items || []).map((p, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{p.name || p.nameMr || p.nameEn || p.title || 'Nutraceutical Wellness Formula'}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>{p.quantity || 1}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(p.price || 0)}</td>
                      <td style={{ textAlign: 'right' }}><strong>{formatCurrency(p.total || ((p.price || 0) * (p.quantity || 1)))}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Total Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <div style={{ minWidth: '240px', background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.grandTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Delivery / Shipping:</span>
                  <span style={{ color: '#159B32', fontWeight: 600 }}>{selectedOrder.shipping ? formatCurrency(selectedOrder.shipping) : 'FREE (मोफत)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, borderTop: '1.5px solid #CBD5E1', paddingTop: '0.5rem', color: '#006B2D' }}>
                  <span>Total Bill Amount:</span>
                  <span>{formatCurrency(selectedOrder.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '1rem', borderTop: '1px dashed #CBD5E1', paddingTop: '0.5rem' }}>
              हे संगणकीय अधिकृत बिल आहे. सहारा सोशल फाऊंडेशन, कोल्हापूर (Maharashtra, India).
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="crm-btn crm-btn-danger crm-btn-sm" 
              onClick={() => handleDeleteOrder(selectedOrder)}
              style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
              title="Delete Order"
            >
              <Trash2 size={14} /> Delete Order
            </button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="crm-btn crm-btn-secondary" 
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                🖨️ Print Bill / Invoice
              </button>
              <button className="crm-btn crm-btn-primary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </CrmModal>
      )}

      {/* Create Order Modal */}
      <CrmModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Order"
        size="lg"
      >
        <form onSubmit={handleCreateOrder}>
          <div className="crm-form-group">
            <label className="crm-form-label">Select Customer</label>
            <select
              className="crm-form-select"
              value={newOrderForm.customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
            >
              <option value="">-- Choose Existing Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.customerId} - {c.mobileNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="crm-form-grid">
            <div className="crm-form-group">
              <label className="crm-form-label">Customer Name *</label>
              <input
                type="text"
                className="crm-input"
                required
                value={newOrderForm.customerName}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Mobile Number *</label>
              <input
                type="tel"
                className="crm-input"
                required
                value={newOrderForm.customerMobile}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, customerMobile: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Select Item *</label>
              <select
                className="crm-form-select"
                required
                value={newOrderForm.productId}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, productId: e.target.value })}
              >
                <option value="">-- Select Item --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="crm-input"
                value={newOrderForm.quantity}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Payment Method</label>
              <select
                className="crm-form-select"
                value={newOrderForm.paymentMethod}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI (PhonePe / GPay / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Cash">Cash at Center</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Order Status</label>
              <select
                className="crm-form-select"
                value={newOrderForm.orderStatus}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, orderStatus: e.target.value })}
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Executive / Counselor</label>
              <select
                className="crm-form-select"
                value={newOrderForm.assignedEmployee}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, assignedEmployee: e.target.value })}
              >
                <option value="">-- Choose Member --</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label className="crm-form-label">Assigned Affiliate Partner (Optional)</label>
              <select
                className="crm-form-select"
                value={newOrderForm.assignedAffiliate}
                onChange={(e) => setNewOrderForm({ ...newOrderForm, assignedAffiliate: e.target.value })}
              >
                <option value="">-- None --</option>
                {affiliates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.referralCode || 'Affiliate'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="crm-form-group">
            <label className="crm-form-label">Delivery Address</label>
            <input
              type="text"
              className="crm-input"
              value={newOrderForm.shippingAddress}
              onChange={(e) => setNewOrderForm({ ...newOrderForm, shippingAddress: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="crm-btn crm-btn-primary">Create Order</button>
          </div>
        </form>
      </CrmModal>
    </div>
  );
}
